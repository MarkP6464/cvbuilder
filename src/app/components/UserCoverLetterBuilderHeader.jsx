import React, { useState } from 'react';
import Link from 'next/link';

const categories = [
  { name: 'CONTACT', link: 'contact' },
  { name: 'CONTENT', link: 'content' },
  { name: 'FINISH UP', link: 'finishup' },
];

const UserCoverLetterBuilderHeader = ({ coverLetterId, initialEnabledCategories }) => {
  const [enabledCategories, setEnabledCategories] = useState(initialEnabledCategories);

  return (
    <div className="w-[1255px] h-[25px] relative flex space-x-8">
      <div className="flex items-center">
        <div className=" pl-[6.28px] pr-[5.75px] pt-[4.76px] pb-[5.33px] bg-neutral-500 bg-opacity-10 rounded-[3.15px] justify-start items-start inline-flex">
          <div
            className="text-neutral-600 text-xs font-bold uppercase leading-3 truncate ..."
            style={{
              maxWidth: '100px',
              fontFamily: '"Source Sans Pro", sans-serif',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontSize: '11.2px',
              lineHeight: '11.2px',
              textAlign: 'left',
              letterSpacing: 'normal',
            }}
          >
            Cover Letter
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {categories.map(category => (
          <Link
            key={category.name}
            href={`/cover-letter/${coverLetterId}/${category.link}`} // Use the custom link here
          >
            <div
              className={`text-xs font-bold font-['Source Sans Pro'] uppercase leading-3 whitespace-nowrap ${
                enabledCategories[category.name] ? 'bg-indigo-500 text-white' : 'text-neutral-600'
              } cursor-pointer rounded-[3.15px] p-[4.76px] pl-[6.28px] pr-[5.80px] pt-[4.76px] pb-[5.33px]'`}
              style={{
                fontSize: '11.2px',
                lineHeight: '11.2px',
                textAlign: 'left',
                letterSpacing: 'normal',
              }}
            >
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserCoverLetterBuilderHeader;
