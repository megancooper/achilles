import {createRouter} from "./context";
import {z} from "zod";
import {TracingPayload, Resolver as ResolverSchema} from "../../schemas";

type Resolver = z.infer<typeof ResolverSchema>;
type NestedTrace = Resolver & {nested?: Resolver[]};

export const traceRouter = createRouter().mutation("getNested", {
  input: TracingPayload,
  resolve({input: trace}) {
    const nestedTrace: NestedTrace[] = [];

    trace.execution.resolvers.forEach(resolver => {
      let isNested = false;
      nestedTrace.forEach(trace => {
        const {startOffset, duration, path} = resolver;
        const {
          startOffset: parentStartOffset,
          duration: parentDuration,
          path: parentPath,
        } = trace;

        const parentEndTime = parentStartOffset + parentDuration;
        const resEndTime = startOffset + duration;
        const isWithinParentPath = parentPath.every(s =>
          path.some(t => t === s)
        );

        if (
          isWithinParentPath &&
          startOffset >= parentStartOffset &&
          resEndTime <= parentEndTime
        ) {
          isNested = true;
          Object.assign(trace, {nested: [...(trace.nested || []), resolver]});
        }
      });

      if (!isNested) {
        nestedTrace.push({...resolver, nested: []});
      }
    });

    return nestedTrace;
  },
});
