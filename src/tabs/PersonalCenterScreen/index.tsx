import React from 'react'
import { Image, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { ReducerTypes } from '../../redux/reducers'
import Icons from '../../component/Icons'
import styles from './styles'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PERSONAL_INFO, RouterTypes, SCHOOL_AUTH } from '../../router'

interface StoreProps {
  username?: string
  expired: boolean
}

interface PersonalCenterProps
  extends StoreProps,
    NativeStackScreenProps<RouterTypes> {}

const PersonalCenter: React.FC<PersonalCenterProps> = props => {
  /**
   * 头部账号区点击事件
   */
  const headerAccountTapCallback = () => {
    if (props.expired) {
      props.navigation.navigate(SCHOOL_AUTH)
    } else {
      props.navigation.navigate(PERSONAL_INFO)
    }
  }
  return (
    <View>
      <View style={{ ...styles.header }}>
        <View style={styles.headerTextView}>
          <Image
            source={require('../../assets/img/studyCenter.png')}
            style={{ width: 26, height: 26 }}
          />
          <View onTouchStart={headerAccountTapCallback}>
            <Text
              style={{
                fontSize: global.styles.$font_size_lg,
                color: global.styles.$text_color,
                paddingStart: global.styles.$spacing_row_base,
              }}>
              {props.username ? props.username : '未登录'}
            </Text>
          </View>
        </View>
        <Icons
          iconText="&#xe600;"
          color={global.styles.$text_color}
          size={global.styles.$font_size_lg}
        />
      </View>
    </View>
  )
}

export default connect<StoreProps, {}, {}, ReducerTypes>(initialState => ({
  username: initialState.user.username,
  expired: initialState.user.expired,
}))(PersonalCenter)
