<script lang="ts">
/* https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/typescript-best-practices.html */
/* https://github.com/bevacqua/dragula/issues/602#issuecomment-477734315 */
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}
</script>

<template>
    <client-only>
        <div>Hello Adventurer!</div>
    </client-only>
</template>