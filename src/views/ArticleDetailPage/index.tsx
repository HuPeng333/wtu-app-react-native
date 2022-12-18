import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import RootArticle from './route/RootArticle'
import { ParamListBase, useRoute } from '@react-navigation/native'
import { ARTICLE_DETAIL_PAGE, UseRouteGeneric } from '../../router'
import { CommunityMessageQueryType } from '../../api/server/community'
import { StyleSheet, Text, View } from 'react-native'
import Icons from '../../component/Icons'
import { StackHeaderProps } from '@react-navigation/stack/src/types'

const Stack = createStackNavigator()

export const ROOT_ARTICLE_PAGE = '/ArticleDetailPage/RootArticle'
export const COMMENT_DETAIL_PAGE = '/ArticleDetailPage/CommentDetailPage'

export type ArticleDetailRouteParam = CommunityMessageQueryType & {
  isSubReply?: boolean
}
export interface ArticleDetailRouteType extends ParamListBase {
  [COMMENT_DETAIL_PAGE]: ArticleDetailRouteParam
  [ROOT_ARTICLE_PAGE]: ArticleDetailRouteParam
}

type Context = {
  uidMapToNickname: Map<number, string>
  msgIdMapToUser: Map<number, { uid: number; nickname: string }>
  messageAttitude: Map<number, 0 | 1>
}

const context: Context = {
  msgIdMapToUser: new Map(),
  uidMapToNickname: new Map(),
  messageAttitude: new Map(),
}

export const MsgInfoContext = React.createContext<Context>(context)

const ArticleDetailPage: React.FC = () => {
  const route = useRoute<UseRouteGeneric<typeof ARTICLE_DETAIL_PAGE>>()
  return (
    <MsgInfoContext.Provider value={context}>
      <Stack.Navigator initialRouteName={ROOT_ARTICLE_PAGE}>
        <Stack.Screen
          name={ROOT_ARTICLE_PAGE}
          component={RootArticle}
          options={{ headerShown: false }}
          initialParams={route.params}
        />
        <Stack.Screen
          name={COMMENT_DETAIL_PAGE}
          component={RootArticle}
          options={{ header: Header }}
        />
      </Stack.Navigator>
    </MsgInfoContext.Provider>
  )
}

const Header: React.FC<StackHeaderProps> = props => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>评论详细</Text>
      <Icons iconText="&#xe612;" size={26} onPress={props.navigation.goBack} />
    </View>
  )
}
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'space-between',
    backgroundColor: global.colors.boxBackgroundColor,
  },
  title: {
    color: global.colors.textColor,
    fontSize: global.styles.$font_size_lg,
  },
})
export default ArticleDetailPage