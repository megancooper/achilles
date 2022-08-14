import create from "zustand";
import shallow from "zustand/shallow";
import {ChangeEventHandler} from "react";
import debounce from "lodash.debounce";

export const useInputStore = create<{
  input: string;
  error: boolean | string;
  setInput: (input: string) => void;
  setError: (error: boolean | string) => void;
}>(set => ({
  input: "",
  error: false,
  setInput: input => set({input}),
  setError: error => set({error}),
}));

export const JsonInput = () => {
  const {setInput, setError} = useInputStore(
    state => ({setInput: state.setInput, setError: state.setError}),
    shallow
  );

  const prettifyInput: ChangeEventHandler<HTMLTextAreaElement> = async e => {
    const userInput = e.target.value;
    if (userInput) {
      setInput(userInput);
    } else {
      setError(false);
    }
  };

  return (
    <textarea
      className="bg-slate-600 p-2 border text-white border-gray-500 rounded shadow outline-gray-600 resize-none mb-4"
      placeholder='Paste the "extensions" object from your apollo graphql response here.'
      cols={75}
      rows={25}
      onChange={debounce(prettifyInput, 500)}
    />
  );
};
