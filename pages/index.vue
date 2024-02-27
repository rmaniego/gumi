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
    </Head>
  </Html>
  <client-only>
    <Map />
  </client-only>
</template>
