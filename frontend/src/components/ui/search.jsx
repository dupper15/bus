import React from "react";
import { Search as SearchIcon } from "lucide-react";

const Search = ({ onChange, text }) => {
  return (
    <div className='relative flex items-center w-full gap-2'>
      <input
        onChange={onChange}
        type='text'
        placeholder={`${text}`}
        className='w-full rounded-lg border border-gray-300 bg-white py-2 px-2 sm:pl-3 sm:pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300'
      />
      <SearchIcon className='absolute right-1 sm:right-3 h-5 w-5 text-gray-500' />
    </div>
  );
};
export default Search;
