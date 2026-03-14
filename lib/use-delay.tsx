export async function delay() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
