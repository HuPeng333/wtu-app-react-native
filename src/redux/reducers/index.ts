import { combineReducers } from 'redux'
import userReducer, { UserState } from './user'
import lessonsTableReducer from './lessonsTable'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistReducer } from 'redux-persist'
import { LessonsTableStates } from '../types/lessonsTableTypes'

const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
}

const lessonsTablePersistConfig = {
  key: 'lessons',
  storage: AsyncStorage,
}

export default combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  lessonsTable: persistReducer(lessonsTablePersistConfig, lessonsTableReducer),
})

export type ReducerTypes = {
  user: UserState
  lessonsTable: LessonsTableStates
}
