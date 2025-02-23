/* eslint-disable */

import { Dialog, Switch, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import './setting.css';
import './input.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import createResumeService from './createResumeService';
import { notification } from 'antd';
import { updateJobDescription } from './updateJobDescription';
import TextArea from 'antd/es/input/TextArea';

const JobModal = ({ onCreated, cvId, title, description }) => {
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement, message) => {
    api.info({
      message: 'Thong bao',
      description: message,
      placement,
    });
  };
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [inputValue, setInputValue] = useState(description);
  console.log('JobModal:::inputValue', inputValue);

  const [formData, setFormData] = useState({
    title: title,
    description: description,
  });

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setInputValue(description)
    setIsOpen(true);
  }

  const handleInputChange = event => {
    const { id, value } = event.target;
    console.log('id value: ', id, value);
    if (id === 'description') {
      setInputValue(event.target.value);
    }
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleTextareaInput = event => {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset the height to auto to recalculate the scroll height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    // Here you can perform any actions with the form data, such as sending it to the server
    console.log('Form data submitted:', formData);

    try {
      const result = await updateJobDescription(cvId, formData);
      openNotification('bottomRight', `Create: ${result.id}`);
      onCreated();
      closeModal();
    } catch (error) {
      if (error.response.data.error) {
        openNotification('bottomRight', `Error: ${error.response.data.error}`);
      } else if (error.response.data && error.response.status === 400 && error.response.data) {
        openNotification('bottomRight', `Error: ${error.response.data}`);
      } else {
        openNotification('bottomRight', `Something went wrong!`);
      }
    }
  };

  // useEffect(() => {
  //   console.log("setInputValue",)
  //   setInputValue(description);
  // }, []);
  return (
    <>
      {contextHolder}
      <div className="inset-0 flex items-center justify-center">
        <button
          href=""
          data-size="default"
          data-theme="default"
          data-busy="false"
          className="form-submission button cta "
          onClick={openModal}
        >
          Update Job Description
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full transform rounded-lg bg-white text-left align-middle shadow-sm transition-all max-w-md opacity-100 scale-100">
                  <Dialog.Title
                    as="h2"
                    className="w-full flex leading-7 text-xl font-semibold bg-slate-50 rounded-t-lg text-gray-900 items-center px-6 py-5 border-b border-slate-200"
                  >
                    <div className="grow font-semibold">Update Job Description</div>
                    <i className="fal fa-times cursor-pointer" aria-hidden="true" />
                  </Dialog.Title>
                  <div className="p-6">
                    <form onSubmit={handleFormSubmit}>
                      <div className="input">
                        <label
                          className="!leading-[15px] !mb-3 label flex flex-col justify-between lg:flex-row lg:items-end text-xs uppercase text-gray-600"
                          htmlFor="resumeName" // Add htmlFor with the correct id
                        >
                          <div className="flex gap-2 items-center">
                            <span>Job title</span> *
                          </div>
                          <div id="null-portal-root" />
                        </label>
                        <div className="relative">
                          <input
                            name="title"
                            className="inputEl new-resume-form"
                            id="title" // Add id attribute here
                            required=""
                            aria-label="Job title"
                            defaultValue={title}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="input ">
                          <label
                            className="!leading-[15px] !mb-3 label flex flex-col justify-between lg:flex-row lg:items-end text-xs uppercase text-gray-600"
                            htmlFor="description"
                          >
                            <div className="flex gap-2 items-center">
                              <span>Job Description </span>
                            </div>
                            <div id="description-portal-root" />
                          </label>
                          <div className="relative">
                            <TextArea
                              className="inputEl new-resume-form"
                              id="description"
                              aria-label="Job Description "
                              onChange={handleInputChange}
                              onInput={handleTextareaInput}
                              value={inputValue}
                              autoSize={{
                                minRows: 2,
                                maxRows: 10,
                              }}
                              style={{
                                height: 'auto',
                                overflow: 'hidden',
                                resize: 'none',
                                // maxHeight: 200,
                                overflowY: 'auto',
                                background: 'white',
                                // height: 120,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        href=""
                        data-size="default"
                        data-theme="default"
                        data-busy="false"
                        className="form-submission button cta "
                        id="create-resume-form-submitted"
                        type="submit"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default JobModal;
