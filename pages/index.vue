<script lang="ts">
/* https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/typescript-best-practices.html */
</script>

<template>
  <Html lang="en">
    <Head>
      <Title>GuMi - Poly Digitization & Boundary Delineation</Title>
      <Meta name="viewport" :content="`width=device-width, initial-scale=1`" />
      <Meta name="description" :content="`Poly Digitization & Boundary Delineation.`" />
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
