import {z} from "zod";
import {useEffect} from "react";
import type {NextPage} from "next";
import {Header} from "../components/header";
import {Footer} from "../components/footer";
import {Inspector, useTraceStore} from "../components/inspector";
import {trpc} from "../utils/trpc";
import {
  TracingPayload as TracingPayloadSchema,
  Resolver as ResolverSchema,
} from "../schemas";
import SpinnerCircle from "../svgs/spinner.svg";

type TracingPayload = z.infer<typeof TracingPayloadSchema>;
type ResolverType = z.infer<typeof ResolverSchema>;
type NestedTrace = ResolverType & {nested?: ResolverType[]};

const Spinner = () => (
  <div className="flex-1 h-[calc(100vh_-_60px)] pt-[30%] bg-slate-900">
    <SpinnerCircle className="block m-auto z-10 h-8 w-8 animate-spin text-gray-200 dark:text-gray-600 fill-gray-600 dark:fill-gray-300" />
  </div>
);

const Inspect: NextPage = () => {
  const trace = useTraceStore(state => state.trace);
  const {
    mutateAsync,
    isLoading,
    data: nestedTrace,
  } = trpc.useMutation(["trace.getNested"]);

  useEffect(() => {
    (async () => {
      if (Object.keys(trace).length) {
        await mutateAsync(trace as TracingPayload);
      }
    })();
  }, [trace, mutateAsync]);

  return (
    <>
      <Header />
      {isLoading ? <Spinner /> : <Inspector nestedTrace={nestedTrace} />}
      <Footer />
    </>
  );
};

export default Inspect;
