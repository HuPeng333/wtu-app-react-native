import React from 'react'
import { SpringScrollView } from 'react-native-spring-scrollview'
import LottieLoadingHeader from './LottieLoadingHeader'
import RetryView from '../EnhancedScrollView/RetryView'
import { View } from 'react-native'
import InitSkeleton from './InitSkeleton'

interface LoadingScrollViewProps {
  /**
   * 当需要加载数据时
   */
  onRequireLoad: () => void
  empty: boolean
  loading: boolean
  error: boolean
  dataLength: number
}

interface LoadingScrollViewState {}

/**
 * 用于加载的容器，会自动显示加载骨架以及失败重试等操作。
 * <p>
 * 不负责渲染列表，请自己渲染。
 */
export class LoadingScrollView extends React.Component<
  LoadingScrollViewProps,
  LoadingScrollViewState
> {
  state: LoadingScrollViewState = {}

  scroll = React.createRef<SpringScrollView>()

  public endLoading() {
    this.scroll.current?.endLoading(true)
  }

  retry() {
    this.props.onRequireLoad()
  }

  constructor(props: LoadingScrollViewProps) {
    super(props)
    this.retry = this.retry.bind(this)
  }

  render() {
    return (
      <SpringScrollView
        ref={this.scroll}
        allLoaded={this.props.empty}
        loadingFooter={LottieLoadingHeader}
        onLoading={this.props.onRequireLoad}>
        {this.props.dataLength === 0 && this.props.loading ? (
          <Skeleton />
        ) : null}
        {this.props.children}
        <RetryView
          onRetry={this.retry}
          show={!this.props.loading && this.props.error}
        />
      </SpringScrollView>
    )
  }
}

const Skeleton: React.FC = () => {
  return (
    <View>
      <InitSkeleton />
      <InitSkeleton />
      <InitSkeleton />
      <InitSkeleton />
      <InitSkeleton />
      <InitSkeleton />
    </View>
  )
}