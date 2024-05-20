import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite'

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.jsm.aora',
  projectId: '66494421002c84d7fab9',
  databaseId: '6649456c000471163643',
  userCollectionId: '6649479600031505590e',
  videoCollectionId: '664947d800076c1c7c8d',
  storageId: '664949c4000490888619'
}

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform)

const account = new Account(client)
const avatars = new Avatars(client)
const databases = new Databases(client)
const storage: any = new Storage(client)

export const createUser = async (email: string, password: string, username: string) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    if (!newAccount) throw new Error
    
    const avatarUrl = avatars.getInitials(username)

    await signIn(email, password)

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    )
    return newUser
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    return await account.createEmailPasswordSession(email, password)
  } catch (error: any) {
    throw new Error(error)
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get()

    if (!currentAccount) throw new Error

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw new Error

    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
  }
}

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    )
    return posts.documents
  } catch (error: any) {
    throw new Error(error)
  }
}

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc('$createdAt'
        // Query.limit(7)
      )]
    )
    return posts.documents
  } catch (error: any) {
    throw new Error(error)
  }
}

export const searchPosts= async (query: string) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search('title', query)]
    )
    return posts.documents
  } catch (error: any) {
    throw new Error(error)
  }
}

export const getUserPost= async (userId: string) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal('creator', userId)]
    )
    return posts.documents
  } catch (error: any) {
    throw new Error(error)
  }
}

export const signOut = async () => {
  try {
    return await account.deleteSession('current')
  } catch (error: any) {
    throw new Error(error)
  }
}

export const getFilePreview = async (fileId: string, type: string) => {
  let fileUrl

  try {
    if (type === 'video') {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId)
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000, 'top', 100)
    } else {
      throw new Error('Invalid file type')
    }

    if (!fileUrl) throw new Error
    return fileUrl
  } catch (error: any) {
    throw new Error(error)
  }
}

export const uploadFile = async (file: any, type: string) => {
  if (!file) return

  const { mimeType, ...rest } = file
  const asset = { type: mimeType, ...rest }

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    )

    const fileUrl = await getFilePreview(uploadedFile.$id, type)
    return fileUrl
  } catch (error: any) {
    throw new Error(error)
  }
}

export const createVideo = async (form: any) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video')
    ])

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId
      }
    )

    return newPost
  } catch (error: any) {
    throw new Error(error)
  }
}
