import React from 'react'
import WebView from 'react-native-webview'
import { Image, PixelRatio, View } from 'react-native'
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes'
import { getLogger } from '../../../utils/LoggerUtils'
import ImagePickMenu, {
  ImageProperty,
} from '../../Drawer/BottomMenu/ImagePickMenu'
import Loading from '../../Loading'
import {
  requirePublicSpaceUploadSecret,
  SignInfo,
  uploadFileToPublicSpace,
} from '../../../api/server/cos'
import Toast from 'react-native-root-toast'
import Environment from '../../../utils/Environment'

const logger = getLogger('/component/Container/RichTextEditor')

interface RichTextEditorProps {
  type?: 'all_functions' | 'image_only'
  onHeightChange?: (height: number) => void
}

interface RichTextEditorState {
  html: string
  height: number
}
interface WebViewMessageType {
  image: void
  content: EditorData
  height: number
}
export type EditorData = {
  /**
   * 纯文本
   */
  text: string
  /**
   * 包含html的内容
   */
  content: string
}

type WebViewMessage<T extends keyof WebViewMessageType> = {
  type: T
  data: WebViewMessageType[T]
}

export default class RichTextEditor extends React.Component<
  RichTextEditorProps,
  RichTextEditorState
> {
  webView = React.createRef<WebView>()

  imagePick = React.createRef<ImagePickMenu>()

  /**
   * 图片本地url -> 远程url
   *
   * 避免相同重复上传
   */
  imageCache = new Map<string, string>()

  onMessage(message: WebViewMessageEvent) {
    let msg: WebViewMessage<any>
    logger.debug('receive webview message: ' + message.nativeEvent.data)
    try {
      msg = JSON.parse(message.nativeEvent.data)
    } catch (e) {
      logger.error('parse message failed, content: ' + message.nativeEvent.data)
      return
    }
    if (msg.type === 'image') {
      this.imagePick.current?.showDrawer()
    } else if (msg.type === 'content') {
      const contentMessage = msg as WebViewMessage<'content'>
      this.contentResolveCallback?.(contentMessage.data)
    } else if (msg.type === 'height') {
      const contentMessage = msg as WebViewMessage<'height'>
      this.setState({
        height: PixelRatio.roundToNearestPixel(contentMessage.data),
      })
    } else {
      logger.warn('unknown message type, data: ' + message.nativeEvent.data)
    }
  }

  private insertImage(url: string) {
    logger.info('insert image: ' + url)
    this.webView.current?.injectJavaScript(
      `insertImage('${Environment.cdnUrl + url}')`
    )
  }

  contentResolveCallback: ((content: EditorData) => void) | undefined

  public getContent() {
    return new Promise<EditorData>(resolve => {
      this.contentResolveCallback = resolve
      this.webView.current?.injectJavaScript('rnGetContent()')
    })
  }

  imageUploadSignCache: SignInfo | undefined

  async onImagePick(image: ImageProperty[]) {
    const img = image[0]
    if (!img) {
      return
    }
    const remoteUrl = this.imageCache.get(img.path)
    logger.info('uploading image...')
    if (remoteUrl) {
      logger.info('image has already uploaded!')
      this.insertImage(remoteUrl)
      return
    }
    Loading.showLoading('上传图片中')
    if (!this.imageUploadSignCache) {
      logger.info('requesting upload sign')
      try {
        this.imageUploadSignCache = (
          await requirePublicSpaceUploadSecret(img.contentType)
        ).data
      } catch (e: any) {
        logger.info('request upload sign failed: ' + e.message)
        Toast.show('上传文件失败: ' + e.message)
        Loading.hideLoading()
        return
      }
    }
    try {
      await uploadFileToPublicSpace(
        this.imageUploadSignCache,
        img.path,
        img.contentType
      )
      this.insertImage(this.imageUploadSignCache.path)
      // save to cache
      this.imageCache.set(img.path, this.imageUploadSignCache.path)
      this.imageUploadSignCache = undefined
    } catch (e: any) {
      logger.error('image upload failed: ' + e.message)
      Toast.show('图片上传失败: ' + e.message)
    } finally {
      Loading.hideLoading()
    }
  }

  onWebViewError({ nativeEvent }: WebViewErrorEvent) {
    Toast.show(nativeEvent.description)
    logger.error(
      'webview error: ' + nativeEvent.title + '; ' + nativeEvent.description
    )
  }

  constructor(props: any) {
    super(props)
    this.state = {
      html: '',
      height: 0,
    }
    this.onMessage = this.onMessage.bind(this)
    this.onImagePick = this.onImagePick.bind(this)
    this.onWebViewError = this.onWebViewError.bind(this)

    if (__DEV__) {
      fetch(
        Image.resolveAssetSource(
          require('../../../assets/html/rich_editor.html')
        ).uri
      )
        .then(resp => resp.text())
        .then(html => {
          this.setState({ html })
        })
    }
  }

  render() {
    return (
      <View style={{ width: '100%', height: this.state.height }}>
        <WebView
          ref={this.webView}
          containerStyle={{ height: this.state.height, width: '100%' }}
          source={
            __DEV__
              ? { html: this.state.html }
              : { uri: Environment.cdnUrl + '/static/html/rich_editor.html' }
          }
          originWhitelist={['*']}
          onMessage={this.onMessage}
          scrollEnabled={false}
          onError={this.onWebViewError}
          showsVerticalScrollIndicator={false}
        />
        <ImagePickMenu onSelect={this.onImagePick} ref={this.imagePick} />
      </View>
    )
  }
}
