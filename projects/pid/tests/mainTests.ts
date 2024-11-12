import { assertEquals } from "@std/assert";
import { createPid } from "../index.ts";

Deno.test("createPid generates appropriate pids.", () => {
  assertEquals(createPid("00000000-0000-0000-0000-000000000000"), "0000000000000000000000000")
  assertEquals(createPid("88888888-8888-8888-8888-888888888888"), "82zpafgscna8ewvuwunzsyi6g")
  assertEquals(createPid("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"), "f5lxx1zz5pnorynqglhzmsp33")
})
