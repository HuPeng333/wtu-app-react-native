import React from 'react'
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import RetryView from '../../EnhancedScrollView/RetryView'
import InitSkeleton from '../InitSkeleton'
import LottieView from 'lottie-react-native'

interface HighPerformanceScrollViewProps<D> extends FlatListProps<D> {
  onRefresh?: () => void
  onLoadMore?: () => void | Promise<unknown>
  numColumns?: number
  allLoaded?: boolean
  keyExtractor: (item: D) => string
  error?: boolean
  loading?: boolean
}

interface HighPerformanceScrollViewState<D> {
  data: Array<D>
  refreshing: boolean
}

/**
 * LoadingScrollView在图片较多的时候会出现掉帧的情况！
 * <p>
 * 为了解决这个问题，在这里使用FlatList实现了相关接口
 */
export default class HighPerformanceScrollView<D> extends React.Component<
  HighPerformanceScrollViewProps<D>,
  HighPerformanceScrollViewState<D>
> {
  public endRefresh() {
    this.setState({ refreshing: false })
  }

  flag = false

  onEndReached = () => {
    if (this.props.loading || this.props.allLoaded) {
      return
    }
    this.loadMoreData()
  }

  private loadMoreData = () => {
    // loading
    this.props.onLoadMore?.()
  }

  constructor(props: HighPerformanceScrollViewProps<D>) {
    super(props)
    this.state = {
      data: [],
      refreshing: false,
    }
  }

  render() {
    let EmptyComponent: React.ComponentType<EmptyComponentProps>
    if (this.props.data && this.props.data.length > 0) {
      EmptyComponent = DefaultEmptyComponent
    } else if (this.props.loading) {
      EmptyComponent = LoadingEmptyComponent
    } else if (this.props.error) {
      EmptyComponent = ErrorComponent
    } else {
      EmptyComponent = DefaultEmptyComponent
    }
    let FooterComponent: React.ComponentType
    if (this.props.allLoaded) {
      FooterComponent = DefaultEmptyComponent
    } else {
      FooterComponent = FooterLoadingComponent
    }
    return (
      <FlatList
        {...this.props}
        style={{ flex: 1 }}
        keyExtractor={this.props.keyExtractor}
        numColumns={this.props.numColumns}
        ListEmptyComponent={() => (
          <EmptyComponent onRetry={this.loadMoreData} />
        )}
        ListFooterComponent={FooterComponent}
        onEndReachedThreshold={0.3}
        onEndReached={this.onEndReached}
        refreshing={this.state.refreshing}
        refreshControl={
          <RefreshControl
            colors={[global.colors.primaryColor]}
            refreshing={this.state.refreshing}
            onRefresh={this.props.onRefresh}
          />
        }
      />
    )
  }
}

interface EmptyComponentProps {
  onRetry?: () => void
}

const ErrorComponent: React.FC<EmptyComponentProps> = props => {
  return <RetryView onRetry={props.onRetry} show />
}

const DefaultEmptyComponent: React.FC = () => {
  return <Text style={global.styles.infoTipText}>我也是有底线的.</Text>
}

const LoadingEmptyComponent: React.FC = () => {
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

const FooterLoadingComponent = () => {
  return (
    <View style={{ width: '100%', height: 60 }}>
      <LottieView
        source={require('../../../assets/lottie/loading.json')}
        loop
        autoPlay
      />
    </View>
  )
}
