import { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { ServerUser } from '../../sqlite/user'

export type ServerUserState = {
  /**
   * 用户是否登录
   */
  authenticated: boolean
  /**
   * 用户信息, 若{@link ServerUserState#authenticated}为true，则该值<b>一定</b>非空
   */
  userInfo?: ServerUserInfo
  /**
   * 缓存用户信息
   *
   * <b>不要使用redux-priests来持久化该属性！因为它可能会很大</b>
   */
  cachedUser: CachedUser
}

export type CachedUser = Record<number, ServerUser>

/**
 * 用户身份信息
 */
export type ServerUserInfo = {
  /**
   * 用户id
   */
  uid: number
  /**
   * 用户名
   */
  username: string
  /**
   * 昵称
   */
  nickname: string
}

type Reducer<T> = CaseReducer<ServerUserState, PayloadAction<T>>

export interface ServerUserReducers extends SliceCaseReducers<ServerUserState> {
  /**
   * 标记用户登录成功
   */
  markLogin: Reducer<ServerUserInfo>
  /**
   * 保存用户信息
   */
  saveUserToCache: Reducer<ServerUser>
  /**
   * 合并用户信息缓存
   */
  combineUserCache: Reducer<CachedUser>
}