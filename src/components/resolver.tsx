import React, {Dispatch, SetStateAction, useState} from "react";
import z from "zod";
import create from "zustand";
import shallow from "zustand/shallow";
import {clsx} from "clsx";
import {Resolver as ResolverSchema, Block as BlockSchema} from "../schemas";
import {nanoToMilli} from "../utils/time";
import CaretRight from "../svgs/caret-right-fill.svg";
import CaretDown from "../svgs/caret-down-fill.svg";

type ResolverType = z.infer<typeof ResolverSchema>;
type NestedTrace = ResolverType & {nested?: ResolverType[]};

export const useHideShortTracesStore = create<{
  hideShortTraces: boolean;
  shortTraceThreshold: number;
  setHideShortTraces: (shouldHide: boolean) => void;
  setShortTraceThreshold: (threshold: number) => void;
  reset: () => void;
}>(set => ({
  shortTraceThreshold: 5,
  hideShortTraces: false,
  setHideShortTraces: hideShortTraces => set({hideShortTraces}),
  setShortTraceThreshold: shortTraceThreshold => set({shortTraceThreshold}),
  reset: () => set({shortTraceThreshold: 5, hideShortTraces: false}),
}));

const TraceDetail = ({title, details}: {title: string; details: string}) => (
  <div className="flex-1 flex items-center mb-4 last-of-type:mb-0 rounded">
    <div className="w-full">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-900">{details}</p>
    </div>
  </div>
);

const isRelativelyShortTrace = ({
  duration,
  fullDuration,
  shortTraceThreshold,
}: {
  duration: number;
  fullDuration: number;
  shortTraceThreshold: number;
}) => (nanoToMilli(duration) * 100) / fullDuration < shortTraceThreshold;

interface BlockProps {
  name?: string;
  block: ResolverType | z.infer<typeof BlockSchema>;
  fullDuration: number;
  parentContainerWidth: number;
  isNested?: boolean;
  hasNestedBlocks?: boolean;
  isNestedVisible?: boolean;
  setIsNestedVisible?: Dispatch<SetStateAction<boolean>>;
}

// eslint-disable-next-line react/display-name
export const Block: React.FC<BlockProps> = React.memo(
  ({
    name,
    block,
    parentContainerWidth,
    fullDuration,
    isNested = false,
    hasNestedBlocks = false,
    isNestedVisible = false,
    setIsNestedVisible = () => {},
  }) => {
    const {startOffset, duration} = block;
    const {hideShortTraces, shortTraceThreshold} = useHideShortTracesStore(
      state => ({
        hideShortTraces: state.hideShortTraces,
        shortTraceThreshold: state.shortTraceThreshold,
      }),
      shallow
    );

    const checkIsResolver = (): ResolverType | false => {
      try {
        return ResolverSchema.parse(block);
      } catch (error) {
        return false;
      }
    };

    const getLeftMargin = () => {
      const offsetMilli = nanoToMilli(startOffset);
      const margin = (offsetMilli * parentContainerWidth) / fullDuration;
      return Math.floor(margin);
    };

    const getBlockWidth = () => {
      const durationMilli = nanoToMilli(duration);
      const blockWidth = (durationMilli * parentContainerWidth) / fullDuration;
      return Math.floor(blockWidth);
    };

    const isLatterBlock = () =>
      getLeftMargin() + getBlockWidth() > parentContainerWidth * 0.6;

    const blockWidth = getBlockWidth();
    const resolver = checkIsResolver();

    return hideShortTraces &&
      isRelativelyShortTrace({
        duration,
        fullDuration,
        shortTraceThreshold,
      }) ? null : (
      <div
        className={clsx(
          "group relative overflow-visible my-2 h-10 border-white hover:border text-white hover:text-black",
          {
            "bg-blue-400 hover:bg-blue-200": !isNested,
            "bg-blue-600 hover:bg-blue-400": isNested,
          }
        )}
        style={{
          marginLeft: getLeftMargin(),
          width: blockWidth,
          minWidth: 5,
        }}
      >
        <button
          className="flex items-center px-1 h-full w-full truncate"
          onClick={() => setIsNestedVisible(prev => !prev)}
        >
          {hasNestedBlocks && !isNestedVisible && <CaretRight />}
          {hasNestedBlocks && isNestedVisible && <CaretDown />}
          <span className="ml-1">{resolver ? resolver.fieldName : name}</span>
        </button>
        <div
          className={clsx(
            "hidden group-hover:block absolute z-[1] min-w-[200px] bg-gray-100 shadow text-black p-2 w-fit",
            {
              "right-0": isLatterBlock(),
            }
          )}
        >
          <TraceDetail
            title="Duration"
            details={`${nanoToMilli(duration).toFixed(4)} ms`}
          />
          <TraceDetail
            title="Start Offset"
            details={`${nanoToMilli(startOffset).toFixed(4)} ms`}
          />
          {resolver &&
            (() => {
              const {returnType, fieldName, path} = resolver;

              return (
                <>
                  <TraceDetail title="Field Name" details={fieldName} />
                  <TraceDetail title="Path" details={path.join(".")} />
                  <TraceDetail title="Return Type" details={returnType} />
                </>
              );
            })()}
        </div>
      </div>
    );
  }
);

export const Resolver: React.FC<{
  trace: NestedTrace;
  parentContainerWidth: number;
  fullDuration: number;
  inView: boolean;
}> = ({inView, trace, fullDuration, ...rest}) => {
  const [isNestedVisible, setIsNestedVisible] = useState<boolean>(false);
  const {hideShortTraces, shortTraceThreshold} = useHideShortTracesStore(
    state => ({
      hideShortTraces: state.hideShortTraces,
      shortTraceThreshold: state.shortTraceThreshold,
    }),
    shallow
  );

  return (
    <div
      className={clsx({
        "min-h-[40px]": !isRelativelyShortTrace({
          duration: trace.duration,
          fullDuration,
          shortTraceThreshold,
        }),
      })}
    >
      {inView && (
        <>
          <Block
            block={trace}
            fullDuration={fullDuration}
            hasNestedBlocks={
              !!trace.nested?.length &&
              trace.nested.some(nestedTrace => {
                return (
                  !hideShortTraces ||
                  !isRelativelyShortTrace({
                    duration: nestedTrace.duration,
                    fullDuration,
                    shortTraceThreshold,
                  })
                );
              })
            }
            setIsNestedVisible={setIsNestedVisible}
            isNestedVisible={isNestedVisible}
            {...rest}
          />
          {trace.nested?.map(nestedTrace => {
            if (!isNestedVisible) return null;

            return (
              <Block
                isNested
                key={nestedTrace.startOffset}
                fullDuration={fullDuration}
                block={nestedTrace}
                {...rest}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
