/* eslint-disable */

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button, Card, ConfigProvider, Space } from 'antd';

import UserCVBuilderHeader from '@/app/components/UserCVBuilderHeader';
import UserCVBuilderLayout from '@/app/components/Layout/UseCVBuilderLayout';

import ProjectForm from '@/app/components/Form/ProjectForm';

import SortCheckbox from './SortCheckbox';
import DataService from '../../../utils/dataService';
import ProjectList from './ProjectList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import ListError from '@/app/components/ListError/ListError';
import { updateProject } from './projectService';
import VideoComponent from '@/app/components/VideoComponent';
import StandarList from '@/app/components/List/StandarList';
import UserLayout from '@/app/components/Layout/UserLayout';

const { Meta } = Card;

const Project = ({ params }) => {
  const [projectData, setProjectData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [enabledCategories, setEnabledCategories] = useState({
    PROJECT: true,
  });
  const [isShow, setIsShow] = useState(true);
  const handleDownButton = () => {
    setIsShow(!isShow);
  };
  console.log('Data: ', params);

  const cvId = params.id;
  const dataService = new DataService('projects', cvId);

  const fetchData = async () => {
    try {
      const fetchedProjectData = await dataService.getAll(); // Renamed 'projectData' to 'fetchedProjectData'
      console.log('fetchData ', fetchedProjectData);
      setSelectedData(null);
      setProjectData(fetchedProjectData);
    } catch (error) {
      console.error('There was an error fetching the data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditData = item => {
    setSelectedData(item);
  };

  const handleDeleteData = async itemId => {
    try {
      await dataService.delete(itemId);
      const updatedData = await dataService.getAll(cvId);
      setProjectData(updatedData);
    } catch (error) {
      console.error('There was an error deleting the data', error);
    }
  };

  const [sortByDate, setSortByDate] = useState(true);

  const handleSortChange = () => {
    setSortByDate(!sortByDate);
  };

  return (
    <main>
      <ConfigProvider>
        <UserLayout
          isCollapsed={true}
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
                  <span className="flex block pb-3 text-md font-bold border-b border-gray-300 list-shown-true">
                    <Space align="center">
                      Your Projects
                      <div className="text-gray-300 align-middle cursor-pointer leading-3 outline-0 ">
                        <FontAwesomeIcon
                          icon={faCaretDown}
                          className={isShow ? 'transform -rotate-90' : 'transform rotate-0'}
                          onClick={handleDownButton}
                        />
                      </div>
                    </Space>
                  </span>
                  <div>
                    {isShow && selectedData && <ListError errors={selectedData?.bulletPointDtos} />}
                  </div>

                  <div style={{ paddingTop: '0px' }}>
                    {isShow &&
                      projectData.map(project => (
                        <StandarList
                          key={project.id}
                          data={project}
                          selectedExperience={selectedData}
                          cvId={cvId}
                          onDelete={handleDeleteData}
                          onEdit={handleEditData}
                          title={project.title}
                          subtitle={''}
                          updateExperience={updateProject}
                        />
                      ))}
                  </div>
                </Card>
              </div>
              <div className="flex flex-col px-4">
                <ProjectForm cvId={cvId} onCreated={fetchData} data={selectedData} />
              </div>
            </div>
          }
        />
      </ConfigProvider>
    </main>
  );
};

export default Project;
