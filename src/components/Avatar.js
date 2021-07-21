/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import profilePic from '../../public/profilePic.png'

const Avatar = ({ imageSrc, userName }) => {

  return (<div className="flex flex-col items-center ">

    <div className="w-24 h-24 overflow-hidden bg-blue-600 border-4 border-blue-500 border-solid rounded-full">
      {imageSrc ? <img width="100%" height="100%" src={imageSrc} alt="users twitter profile picture" /> : <Image width="100%" height="100%" src={profilePic} alt="users twitter profile picture" />}
    </div>
    {userName ?? <p className="pt-1 font-sans text-base font-semibold text-gray-800">{userName}</p>}
  </div>)
}

export default Avatar