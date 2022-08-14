import shallow from "zustand/shallow";
import {z, ZodError} from "zod";
import {NextPage} from "next";
import {useRouter} from "next/router";
import {Header} from "../components/header";
import {Footer} from "../components/footer";
import {JsonInput, useInputStore} from "../components/json-input";
import {useTraceStore} from "../components/inspector";
import {useHideShortTracesStore} from "../components/resolver";
import {TracingPayload as TracingPayloadSchema} from "../schemas";

type TracingPayload = z.infer<typeof TracingPayloadSchema>;
type Input = {extensions: {tracing: TracingPayload}} & {
  tracing: TracingPayload;
} & TracingPayload;

const validate = (
  inputStr: string
): ZodError | SyntaxError | undefined | TracingPayload => {
  try {
    const input = JSON.parse(inputStr) as Input;
    const trace = input?.extensions?.tracing || input?.tracing || input;
    const validTrace = TracingPayloadSchema.parse(trace);
    return validTrace;
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return error;
    }
  }
  return;
};

const Home: NextPage = () => {
  const router = useRouter();
  const {input, error, setError} = useInputStore(
    state => ({
      input: state.input,
      setError: state.setError,
      error: state.error,
    }),
    shallow
  );
  const resetHiddenTraces = useHideShortTracesStore(
    state => state.reset,
    shallow
  );
  const {setTrace} = useTraceStore(
    state => ({setTrace: state.setTrace}),
    shallow
  );

  const handleInspectTrace = () => {
    if (input) {
      resetHiddenTraces();
      const trace = validate(input);

      if (trace instanceof SyntaxError) {
        setError("Failed to parse JSON input.");
        return;
      }

      if (trace instanceof ZodError) {
        setError("Invalid apollo trace format.");
        return;
      }

      if (!!trace) {
        setTrace(trace as TracingPayload);
        router.push("/inspect");
      }
    }
  };

  const Error = () => (
    <div className="rounded bg-red-300 p-4 mb-4">
      <div className="flex">
        <h3 className="text-sm font-medium text-red-800">
          {error || "An error occurred."}
        </h3>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <main className="bg-slate-900">
        <div className="container mx-auto flex flex-col items-center justify-center p-4">
          <h1 className="text-white text-2xl mb-4">Achilles</h1>
          <p className="font-light text-slate-500 mb-4">
            visualizes the payload from the&nbsp;
            <a
              href="https://github.com/apollographql/apollo-tracing"
              target="_blank"
              rel="noreferrer"
              className="text-blue-300"
            >
              apollo-tracing extension
            </a>
            .
          </p>
          <JsonInput />
          {error && <Error />}
          <button
            type="button"
            disabled={!!error || !input}
            onClick={handleInspectTrace}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Inspect Trace
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;
