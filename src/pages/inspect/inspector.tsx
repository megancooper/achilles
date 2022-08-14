import React, {memo} from "react";
import create from "zustand";
import Link from "next/link";
import {z} from "zod";
import {useResizeDetector} from "react-resize-detector";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import {InView} from "react-intersection-observer";
import {
  TracingPayload as TracingPayloadSchema,
  Resolver as ResolverSchema,
} from "../../schemas";
import {nanoToMilli, getNumChunksOfTime} from "../../utils/time";
import {Block, Resolver} from "./components";
import CrossHair from "../../svgs/cross-hair.svg";
import HandFinger from "../../svgs/hand-finger.svg";

type TracingPayload = z.infer<typeof TracingPayloadSchema>;
type ResolverType = z.infer<typeof ResolverSchema>;
type NestedTrace = ResolverType & {nested?: ResolverType[]};

export const useTraceStore = create<{
  trace: TracingPayload | {};
  setTrace: (a: TracingPayload) => void;
}>(set => ({
  trace: {},
  setTrace: trace => set({trace}),
}));

const EmptyState = () => (
  <div className="text-center h-screen bg-slate-900 pt-[20%]">
    <CrossHair className="mx-auto h-12 w-12 stroke-white" />
    <h3 className="mt-2 text-lg font-medium text-white">No trace found</h3>
    <p className="mt-1 text-sm text-white">
      Get started by entering an apollo graphql trace.
    </p>
    <Link href="/">
      <button
        type="button"
        className="inline-flex items-center mt-6 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
      >
        <HandFinger className="-ml-1 mr-2 h-5 w-5 stroke-white" />
        Add a trace
      </button>
    </Link>
  </div>
);

export const Inspector: React.FC<{nestedTrace?: NestedTrace[]}> = ({
  nestedTrace,
}) => {
  const trace = useTraceStore(state => state.trace);
  const [parent] = useAutoAnimate<HTMLDivElement>();
  const {width = 0, ref} = useResizeDetector({targetRef: parent});

  if (!Object.keys(trace).length) return <EmptyState />;

  const {parsing, validation, duration = 0} = trace as TracingPayload;
  const fullDuration = nanoToMilli(duration);
  const {numChunksOfTime, scale} = getNumChunksOfTime(fullDuration);

  return (
    <>
      <div className="sticky top-0 flex w-full z-[2] h-[42px] p-2 bg-slate-800 border-t border-b border-slate-600 text-white min-w-fit">
        <div className="p-1 absolute left-0 bottom-1 text-gray-500">
          0&nbsp;ms
        </div>
        {Array.from({length: numChunksOfTime - 1}, (v, i) => i + 1).map(
          block => (
            <div
              key={block}
              className="p-1 absolute bottom-1"
              style={{
                left: `${Math.floor(
                  (block * scale * 100) / nanoToMilli(duration)
                )}%`,
              }}
            >
              {block * scale}&nbsp;ms
            </div>
          )
        )}
        <div className="p-1 absolute right-0 bottom-1 text-gray-500">
          {nanoToMilli(duration).toFixed(0)}&nbsp;ms
        </div>
      </div>

      <div
        ref={ref}
        className="overflow-scroll bg-slate-800 border-b border-slate-600 flex-1 shadow h-screen"
      >
        {!!parsing && (
          <Block
            name="parsing"
            block={{
              startOffset: parsing.startOffset,
              duration: parsing.duration,
            }}
            parentContainerWidth={width}
            fullDuration={fullDuration}
          />
        )}
        {!!validation && (
          <Block
            name="validation"
            block={{
              startOffset: validation.startOffset,
              duration: validation.duration,
            }}
            parentContainerWidth={width}
            fullDuration={fullDuration}
          />
        )}
        {nestedTrace?.length &&
          nestedTrace.map(trace => (
            <InView key={trace.startOffset} root={ref.current}>
              {({inView, ref}) => (
                <div ref={ref} key={trace.startOffset}>
                  <Resolver
                    trace={trace}
                    parentContainerWidth={width}
                    fullDuration={fullDuration}
                    inView={inView}
                  />
                </div>
              )}
            </InView>
          ))}
      </div>
    </>
  );
};

export default Inspector;
