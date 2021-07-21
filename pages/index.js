import Head from 'next/head'
import Image from 'next/image'
import Avatar from '../src/components/Avatar'
export default function Home() {
  return (
    <div >
      <Head>
        <title>Twitter Sentiment Analysis</title>
        <meta name="description" content="home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container flex items-center justify-center h-screen mx-auto align-middle ">
        <Avatar/>
      </div>
    </div>
  )
}
