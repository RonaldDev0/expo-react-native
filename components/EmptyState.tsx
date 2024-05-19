import { View, Text, Image } from 'react-native'
import { router } from 'expo-router'
import { images } from '@/constants'
import CustomButton from '@/components/CustomButton'

export default function EmptyState ({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <View className='justify-center items-center p-x-4'>
      <Image
        source={images.empty}
        className='w-[270px] h-[215px]'
        resizeMode='contain'
      />
      <Text className='font-pmedium text-sm text-gray-100'>
        {subtitle}
      </Text>
      <Text className='text-xl text-center font-psemibold text-white mt-2'>
        {title}
      </Text>
      <CustomButton
        title='Create video'
        handlePress={() => router.push('/create')}
        containerStyles='w-full my-5'
      />
    </View>
  )
}