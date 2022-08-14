import Head from "next/head";
import Link from "next/link";
import shallow from "zustand/shallow";
import {useRouter} from "next/router";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import CrossHair from "../svgs/cross-hair.svg";
import InfoCircle from "../svgs/info-circle.svg";
import {useTraceStore} from "./inspector";
import {useHideShortTracesStore} from "../components/resolver";
import demo from "../mocks/demo.json";

export const Header = () => {
  const router = useRouter();
  const [parent] = useAutoAnimate<HTMLElement>();
  const {
    setHideShortTraces,
    hideShortTraces,
    shortTraceThreshold,
    setShortTraceThreshold,
    reset: resetHiddenTraces,
  } = useHideShortTracesStore();
  const setTrace = useTraceStore(state => state.setTrace, shallow);

  const isInspect = router.pathname.includes("inspect");

  const showDemo = () => {
    resetHiddenTraces();
    setTrace(demo);
    router.push("/inspect");
  };

  return (
    <>
      <Head>
        <title>Achilles</title>
        <meta
          name="description"
          content="Visualizer for apollo trace extension"
        />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <header className="bg-slate-900">
        <nav
          className="bg-inherit max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Top"
          ref={parent}
        >
          <div className="w-full py-2 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <a className="flex items-center text-base font-medium text-white hover:text-gray-50">
                  Achilles
                  <CrossHair className="ml-2 stroke-white w-6" />
                </a>
              </Link>
            </div>

            <div className="ml-10 space-x-4">
              {isInspect ? (
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="hide-short-traces"
                      name="hide short traces"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 border-gray-300 rounded"
                      onChange={e => setHideShortTraces(e.target.checked)}
                    />
                  </div>
                  <div className="ml-3 text-sm flex items-center">
                    <label
                      htmlFor="hide-short-traces"
                      className="text-base font-medium text-white"
                    >
                      Hide short traces
                    </label>
                  </div>

                  <div className="group relative">
                    <InfoCircle className=" stroke-gray-400 w-5 ml-2" />

                    <div className="hidden group-hover:block absolute top-[40px] right-0 w-[200px] z-[3] py-1 rounded bg-slate-600 text-white">
                      <div className="mx-auto container max-w-[228px] px-4 relative">
                        <p className=" text-sm leading-4 pt-2 pb-2">
                          Hides traces that are significantly shorter than the
                          average trace.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={showDemo}
                  className="text-base font-medium text-white hover:text-gray-50"
                >
                  Demo
                </button>
              )}
            </div>
          </div>

          {hideShortTraces && isInspect && (
            <div className="bg-inherit w-full flex items-center justify-end pb-4">
              <span className="text-base font-medium text-white">
                &nbsp;whose duration is&nbsp;
              </span>

              <div className="inline-flex flex-row rounded-lg relative bg-transparent mt-1">
                <button
                  data-action="decrement"
                  className=" bg-slate-600 hover:bg-slate-500 border border-gray-300 font-semibold text-white hover:text-gray-50 w-6 cursor-pointer outline-none rounded-l-sm"
                  onClick={() =>
                    setShortTraceThreshold(shortTraceThreshold - 1)
                  }
                  disabled={shortTraceThreshold === 0}
                >
                  <span className="m-auto text-xl leading-[10px] font-thin">
                    −
                  </span>
                </button>

                <input
                  min="0"
                  max="100"
                  type="number"
                  step={1}
                  value={shortTraceThreshold}
                  onChange={e =>
                    setShortTraceThreshold(parseInt(e.target.value))
                  }
                  name="hidden short traces threshold"
                  className="appearance-none text-white text-center block w-[50px] px-3 py-2 border border-gray-300 border-x-0 shadow-sm placeholder-gray-400 bg-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  data-action="increment"
                  className="bg-slate-600 hover:bg-slate-500 border border-gray-300 font-semibold text-white hover:text-gray-50 w-6 cursor-pointer rounded-r-sm"
                  onClick={() =>
                    setShortTraceThreshold(shortTraceThreshold + 1)
                  }
                  disabled={shortTraceThreshold === 100}
                >
                  <span className="m-auto text-xl leading-[10px] font-thin">
                    +
                  </span>
                </button>
              </div>
              <span className="text-base font-medium text-white">
                &nbsp;% shorter than the full request duration.
              </span>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};
