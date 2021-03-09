import { useEffect, useState } from "react";
import { Observable, isObservableArray, ObservableArray } from "knockout";
export function useObservableState<T>(observable: ObservableArray<T[]> | Observable<T>): [T, (state: T) => void] {
  const [value, setValue] = useState(observable);
  useEffect(() => {
    if (!observable) {
      return undefined;
    }

    const subscription = isObservableArray(observable)
      ? observable.subscribe((values) => setValue([...values]))
      : observable.subscribe(setValue);

    return () => subscription.dispose();
  }, [observable]);

  return [value, observable];
}
