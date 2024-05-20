import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Bookmark () {
  return (
    <SafeAreaView className='bg-primary h-full justify-center items-center'>
      <Text className='text-white'>
        Bookmark
      </Text>
    </SafeAreaView>
  )
}