/* eslint-disable */

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button, Card, ConfigProvider } from 'antd';
import dynamic from 'next/dynamic';

import UserCVBuilderHeader from '@/app/components/UserCVBuilderHeader';
import UserCVBuilderLayout from '@/app/components/Layout/UseCVBuilderLayout';
import ExperienceForm from '@/app/components/Form/ExperienceForm';
import VideoComponent from '@/app/components/VideoComponent';

import SortCheckbox from './SortCheckbox';
import ExperienceList from './ExperienceList';
import { deleteExperience, getAllExperiences } from './experienceService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import ListError from '@/app/components/ListError/ListError';
import Head from 'next/head';
import StandarList from './StandarList';

const { Meta } = Card;

const Experience = ({ params }) => {
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [enabledCategories, setEnabledCategories] = useState({
    EXPERIENCE: true,
  });
  console.log('Experiences: ', params);

  const cvId = params.id;

  const fetchExperiences = async () => {
    try {
      const data = await getAllExperiences(cvId);
      console.log('data getAllExperiences ', data);
      setSelectedExperience(null);
      setExperiences(data);
    } catch (error) {
      console.error('There was an error fetching the experiences', error);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleEditExperience = experience => {
    setSelectedExperience(experience);
  };
  const handleDeleteExperience = async experienceId => {
    try {
      console.log('deleteExperience id ', experienceId);

      await deleteExperience(cvId, experienceId);

      // Refresh the experiences list after deletion
      const updatedExperiences = await getAllExperiences(cvId);

      setExperiences(updatedExperiences);
    } catch (error) {
      console.error('There was an error deleting the experience', error);
    }
  };
  const [sortByDate, setSortByDate] = useState(true);

  const handleSortChange = () => {
    setSortByDate(!sortByDate);
    // You can implement your sorting logic here
  };

  // const Video = dynamic(() => import('../../../components/VideoComponent'), {
  //   ssr: true,
  // });

  const [isShow, setIsShow] = useState(true);
  const handleDownButton = () => {
    setIsShow(!isShow);
  };
  console.log('experiences: ', experiences);
  console.log('experiences.bulletPointDtos: ', experiences.bulletPointDtos);

  return (
    <main>
      <ConfigProvider>
        <UserCVBuilderLayout
          userHeader={
            <UserCVBuilderHeader initialEnabledCategories={enabledCategories} cvId={params.id} />
          }
          content={
            <div className="flex h-screen w-full">
              <div className="flex flex-col p-4" style={{ width: '320px', marginRight: '36px' }}>
                <div style={{ height: '185px', width: '320px' }}>
                  <div style={{ maxHeight: '185px' }}>
                    <VideoComponent />
                  </div>
                </div>
                <Card
                  style={{
                    width: '320px',
                    marginTop: '16px',
                    textAlign: 'left',
                    borderRadius: '8px',
                    boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span className="block pb-3 text-md font-bold border-b border-gray-300 list-shown-true">
                    Your Experiences
                    <div className="text-gray-300 p-2 align-middle cursor-pointer leading-3 outline-0 ">
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className={isShow ? 'transform -rotate-90' : 'transform rotate-0'}
                        onClick={handleDownButton}
                      />
                    </div>
                  </span>
                  <div>
                    {selectedExperience && (
                      <ListError errors={selectedExperience?.bulletPointDtos} />
                    )}
                  </div>

                  <div style={{ paddingTop: '16px' }}>
                    {experiences.map(experience => (
                      <StandarList
                        key={experience.id}
                        data={experience}
                        selectedExperience={selectedExperience}
                        cvId={cvId}
                        onDelete={handleDeleteExperience}
                        onEdit={handleEditExperience}
                        title={experience.role}
                        subtitle={experience.companyName}
                      />
                    ))}
                  </div>
                </Card>
                {/* 
                <div className="mb-8 p-[27px] bg-white rounded-[9px] shadow flex-col justify-start items-start gap-[17px] inline-flex">
                  <div style={{ width: '320px', marginTop: '0px', marginBottom: '0px' }}>
                    <div style={{ maxWidth: '320px' }} className="">
                      <div className="w-[266px] h-[50.50px] flex border-b border-gray-300">
                        <div className="left-0 top-[1.47px] text-slate-700 text-lg font-bold font-['Source Sans Pro'] leading-7">
                          Your Experiences
                        </div>
                        <div className="text-gray-300 p-2 align-middle cursor-pointer leading-3 outline-0 ">
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            className={isShow ? 'transform -rotate-90' : 'transform rotate-0'}
                            onClick={handleDownButton}
                          />
                        </div>
                      </div>

                      {isShow && (
                        <>
                          {selectedExperience && (
                            <ListError errors={selectedExperience?.bulletPointDtos} />
                          )}
                          {experiences.map(experience => (
                            <StandarList
                              key={experience.id}
                              data={experience}
                              selectedExperience={selectedExperience}
                              cvId={cvId}
                              onDelete={handleDeleteExperience}
                              onEdit={handleEditExperience}
                              title={experience.role}
                              subtitle={experience.companyName}
                            />
                          ))}
                        </>
                      )}

                
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="flex flex-col px-4">
                <ExperienceForm
                  cvId={cvId}
                  onExperienceCreated={fetchExperiences}
                  experience={selectedExperience}
                />
              </div>
            </div>
          }
        />
      </ConfigProvider>
    </main>
  );
};

export default Experience;
