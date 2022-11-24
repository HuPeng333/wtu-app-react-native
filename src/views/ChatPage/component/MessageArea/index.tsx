import React, { useEffect, useRef, useState } from 'react'
import { SpringScrollView } from 'react-native-spring-scrollview'
import useMessageManager from '../../hook/useMessageManager'
import { useDispatch, useSelector } from 'react-redux'
import { ReducerTypes } from '../../../../redux/counter'
import { SqliteMessage } from '../../../../sqlite/message'
import { resetCurrentTalkMessage } from '../../../../redux/counter/messageSlice'
import { View } from 'react-native'
import { quickShowErrorTip } from '../../../../native/modules/NativeDialog'
import SimpleLoadingHeader from '../SimpleLoadingHeader'
import { getLogger } from '../../../../utils/LoggerUtils'
import EmptyLoadingHeader from '../EmptyLoadingHeader'
import AbstractMessage from '../../message/AbstractMessage'
import NormalMessage from '../../message/chat/NormalMessage'
import NewlyMessageContainer from '../../message/component/NewlyMessageContainer'
import MessageContainer from '../../message/component/MessageContainer'

interface MessageAreaProps {
  chatWith: number
}

const logger = getLogger('views/ChatPage/component/MessageArea')

/**
 * 如果当前滚动条位置低于该值，在接收到新消息后会自动滑动到最底部
 */
const AUTO_TO_BOTTOM_OFFSET = 5

const MessageArea: React.FC<MessageAreaProps> = props => {
  const { messages, loadNextPage } = useMessageManager(props.chatWith)
  const scroll = useRef<SpringScrollView>(null)

  // 防止初始化时显示了currentTalk的内容，最开始的时候这个值应该清空
  const ready = useRef(false)
  // 新消息列表，id大的应该在数组的前面
  const [newlyMessage, setNewlyMessage] = useState<Array<AbstractMessage>>([])
  const pointer = useRef(0)
  const currentTalk = useSelector<ReducerTypes, Array<SqliteMessage>>(
    state => state.message.onlineMessages
  )
  const dispatch = useDispatch()

  /**
   * 当前是否可以加载历史消息
   */
  function loadHistoryAvailable() {
    return scroll.current
      ? scroll.current._contentHeight >= scroll.current._height
      : false
  }

  /**
   * 下拉回调，加载更多历史消息
   */
  const loadHistoryMessage = () => {
    const scr = scroll.current
    if (!scr) {
      return
    }
    if (!loadHistoryAvailable()) {
      // 防止高度不够触发了下拉刷新
      scr.endLoading(true)
      return
    }
    logger.info('loading history message')
    loadNextPage()
      .catch(e => {
        quickShowErrorTip('加载消息失败', e.message)
      })
      .finally(() => {
        scroll.current?.endLoading(true)
      })
  }

  /**
   * 防止底部插入消息造成视觉上的消息"被顶上去了"
   *
   * 同时如果用户当前滚动条在最底部，提供滑动入场的视觉效果
   */
  const onNewMsgMeasureDone = (height: number, show: () => void) => {
    const scr = scroll.current!
    show()
    scr
      .scrollTo(
        {
          x: 0,
          y: scr._contentOffset.y + height,
        },
        false
      )
      .then(() => {
        if (scr._contentOffset.y <= AUTO_TO_BOTTOM_OFFSET) {
          // 回到底部(这里滚动条被反转了)
          scr.scrollToBegin(true).catch(e => {
            logger.error('scroll to begin failed: ' + e.message)
          })
        }
      })
      .catch(e => {
        logger.error(
          'callback "onNewMsgMeasureDone" occurs error: ' + e.message
        )
      })
  }

  // 在内容更新前的容器高度
  useEffect(() => {
    if (currentTalk.length === 0) {
      ready.current = true
    }
    if (!ready.current) {
      return
    }
    const waitingAppend: Array<AbstractMessage> = []
    for (
      let len = currentTalk.length;
      pointer.current < len;
      ++pointer.current
    ) {
      const msg = currentTalk[pointer.current]
      if (msg.uid === props.chatWith) {
        waitingAppend.push(
          new NormalMessage(AbstractMessage.removeTypeMarker(msg.content), msg)
        )
      }
    }
    if (waitingAppend.length === 0) {
      return
    }
    // 消息id不一定是递增的
    setNewlyMessage(
      waitingAppend
        .concat(newlyMessage)
        .sort((a, b) => b.createTime - a.createTime)
    )
  }, [currentTalk])

  useEffect(() => {
    // 防止消息重复加载
    dispatch(resetCurrentTalkMessage())
    if (currentTalk.length === 0) {
      ready.current = true
    }
    return () => {
      dispatch(resetCurrentTalkMessage())
    }
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <SpringScrollView
        loadingFooter={
          loadHistoryAvailable() ? SimpleLoadingHeader : EmptyLoadingHeader
        }
        onLoading={loadHistoryMessage}
        showsVerticalScrollIndicator
        inverted
        ref={scroll}
        style={{ paddingBottom: global.styles.$spacing_col_base }}>
        {/*TODO 可以考虑由实现类直接提供整个消息行的渲染*/}
        {newlyMessage.map(value => (
          <NewlyMessageContainer
            onMeasureDone={onNewMsgMeasureDone}
            chatMessage={value.message}
            key={value.key}
            {...value.props}>
            {value.render()}
          </NewlyMessageContainer>
        ))}
        {messages.map(value => (
          <MessageContainer
            chatMessage={value.message}
            key={value.key}
            {...value.props}>
            {value.render()}
          </MessageContainer>
        ))}
      </SpringScrollView>
    </View>
  )
}

export default MessageArea