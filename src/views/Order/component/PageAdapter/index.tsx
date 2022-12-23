import React, { useEffect, useRef, useState } from 'react'
import { OrderDetail } from '../../../../api/server/order'
import { LoadingScrollView } from '../../../../component/LoadingScrollView'
import { Text, View } from 'react-native'
import OrderItem from '../OrderItem'
import CancelOrderDrawer from '../CancelOrderDrawer'
import OrderDetailDrawer from '../OrderDetailDrawer'
import usePage from '../../../../hook/usePage'
import Drawer from '../../../../component/Drawer'
import { showSingleBtnTip } from '../../../../native/modules/NativeDialog'
import { ResponseTemplate } from '../../../../api/server/types'

interface PageAdapterProps {
  loadData: (
    page: number,
    size: number
  ) => Promise<ResponseTemplate<OrderDetail[]>>
}

const PageAdapter: React.FC<PageAdapterProps> = props => {
  const page = usePage<OrderDetail>(props.loadData, 6)
  const loading = useRef<LoadingScrollView>(null)
  const cancelDrawer = useRef<Drawer>(null)
  const previewDrawer = useRef<Drawer>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | undefined>()

  const loadData = () => {
    page
      .loadMore()
      .catch(e => {
        showSingleBtnTip('加载失败', e.message)
      })
      .finally(() => {
        loading.current?.endLoading()
      })
  }

  const onCancel = (order: OrderDetail) => {
    setSelectedOrder(order)
    cancelDrawer.current?.showDrawer()
  }

  const checkOrder = (order: OrderDetail) => {
    setSelectedOrder(order)
    previewDrawer.current?.showDrawer()
  }

  const onOrderRemove = (order: OrderDetail) => {
    const data = page.data
    page.setData(data.filter(value => value.orderId !== order.orderId))
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <LoadingScrollView
        ref={loading}
        {...page}
        dataLength={page.data.length}
        onRequireLoad={loadData}>
        {page.data.map(value => (
          <OrderItem
            order={value}
            onCancel={onCancel}
            onPress={() => checkOrder(value)}
            key={value.orderId}
          />
        ))}
        {page.empty ? (
          <Text style={[global.styles.infoTipText, { textAlign: 'center' }]}>
            没有更多数据了...
          </Text>
        ) : null}
      </LoadingScrollView>
      <CancelOrderDrawer
        order={selectedOrder}
        drawerRef={cancelDrawer}
        onOrderCancel={onOrderRemove}
      />
      <OrderDetailDrawer
        order={selectedOrder}
        drawerRef={previewDrawer}
        onRequireRemove={onOrderRemove}
      />
    </View>
  )
}

export default PageAdapter
