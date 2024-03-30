<template>
  <Html lang="en">
    <Head>
      <Title>GuMi - Polygon Digitization & Boundary Delineation</Title>
      <Meta name="viewport" :content="`width=device-width, initial-scale=1`" />
      <Meta
        name="description"
        :content="`Poly Digitization & Boundary Delineation.`"
      />
      <Meta
        name="keywords"
        content="GuMI, gumi, map, polygon, digitizaton, boundary, delination"
      />
      <Link rel="icon" type="image/png" href="/adventurer.png"></Link>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Micro+5&family=Roboto:ital,wght@0,100..900;1,100..900&family=Leckerli+One&display=swap"
        rel="stylesheet"
      />
      <link href="/reset.css" rel="stylesheet" />
    </Head>
  </Html>
  <client-only>
    <Map />
  </client-only>
</template>
