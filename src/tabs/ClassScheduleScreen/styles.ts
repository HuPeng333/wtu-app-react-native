import { StyleSheet } from 'react-native'

export const PULL_DOWN_AREA_HEIGHT = 60

export default StyleSheet.create({
  cardOuter: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  cardContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  cardTitleText: {
    color: global.styles.$primary_color,
  },
  classScheduleContainer: {
    height: '100%',
  },
  pullDownArea: {
    height: PULL_DOWN_AREA_HEIGHT,
    padding: 10,
    backgroundColor: 'skyblue',
  },
})
