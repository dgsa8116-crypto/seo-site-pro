import Head from "next/head";

export default function SEO({ meta }) {
  const {
    title,
    description,
    url = "https://tntlinebotseemyeyes.online",
    image = "/og-image.png",
    keywords = []
  } = meta || {};
  
  const imgUrl = image?.startsWith("http") ? image : url + image;

  return (
    <Head>
      <title>{title}</title>
      <meta name="google-site-verification" content="rAVGA4wUDHCgqIShWsavnnp7dwq1hFxGgWsjqz8AG_Y" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#00e5ff" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imgUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imgUrl} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
