/* eslint-disable */

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createExperience, updateExperience } from '@/app/resume/[id]/experience/experienceService';
import { Button, Divider, Form, Input, InputNumber, Space, Switch, Typography } from 'antd';
import moment from 'moment';
import './test.css';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import TextArea from 'antd/es/input/TextArea';
import './date.css';
import './datepicker.css';

import { format, parse } from 'date-fns';
import { lobster } from '@/app/font';
import { Box } from '@chakra-ui/react';
const { RangePicker } = DatePicker;

const ExperienceForm = ({ cvId, onExperienceCreated, experience }) => {
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false); // Add this state
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);

  useEffect(() => {
    if (experience) {
      setIsEditMode(true); // Set to edit mode if experience prop is provided
      setInputValue(experience.description);
      const startDateString = experience.duration.split(' - ')[0];
      const endDateString = experience.duration.split(' - ')[1];
      console.log('startDateString: ', startDateString);
      console.log('endDateString: ', endDateString);
      if (endDateString === 'Present') {
        setIsCurrentlyWorking(true);
        console.log('useEffect: setIsCurrentlyWorking to true');
        const parsedStartDate = parse(startDateString, 'MMMM yyyy', new Date());
        setStartDate(parsedStartDate);
        setEndDate(new Date());
      } else {
        setIsCurrentlyWorking(false);
        console.log('useEffect: setIsCurrentlyWorking to false');
        const parsedStartDate = parse(startDateString, 'MMMM yyyy', new Date());
        const parsedEndDate = parse(endDateString, 'MMMM yyyy', new Date());
        setStartDate(parsedStartDate);
        setEndDate(parsedEndDate);
      }
      form.setFieldsValue(experience);
    } else {
      form.resetFields();
      setInputValue('');
      setStartDate('');
      setIsCurrentlyWorking(false);
      setEndDate('');
      setIsEditMode(false); // Set to create mode if experience prop is not provided
    }
  }, [experience, form]);

  const handleTextareaInput = event => {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset the height to auto to recalculate the scroll height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
  };
  const handleSubmit = async values => {
    try {
      values.description = inputValue;
      if (isCurrentlyWorking) {
        values.duration = `${format(startDate, 'MMMM yyyy')} - Present`;
      } else {
        values.duration = `${format(startDate, 'MMMM yyyy')} - ${format(endDate, 'MMMM yyyy')}`;
      }
      if (isEditMode) {
        await updateExperience(cvId, experience.id, values);
        setIsEditMode(false);
        form.resetFields();
        setInputValue('');
        setStartDate('');
        setIsCurrentlyWorking(false);
        setEndDate('');
      } else {
        await createExperience(cvId, values);
        form.resetFields();
        setInputValue('');
        setStartDate('');
        setIsCurrentlyWorking(false);
        setEndDate('');
      }
      onExperienceCreated();
    } catch (error) {
      console.log('Submit ExperienceForm. Error:', error);
    }
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = inputRef.current;
      const cursorPosition = input.selectionStart;

      // Find the current line
      let lineStart = cursorPosition;
      while (lineStart > 0 && inputValue[lineStart - 1] !== '\n') {
        lineStart--;
      }

      // Check if the line already starts with a bullet point
      if (inputValue.slice(lineStart, cursorPosition).trim() !== '•') {
        // If not, add a bullet point and adjust the cursor position
        const newValue = `${inputValue.slice(0, cursorPosition)}\n• ${inputValue.slice(
          cursorPosition,
        )}`;
        setInputValue(newValue);
        input.setSelectionRange(cursorPosition + 3, cursorPosition + 3);
      } else {
        // If it starts with a bullet point, simply move to the new line
        const newValue = `${inputValue.slice(0, cursorPosition)}\n${inputValue.slice(
          cursorPosition,
        )}`;
        setInputValue(newValue);
        input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }
    }
  };

  const handleInputChange = event => {
    const newInputValue = event.target.value;

    const lines = newInputValue.split('\n');
    const formattedLines = lines.map((line, index) => {
      if (index === 0) {
        // Ensure the first line always starts with a bullet point
        return line.startsWith('•') ? line : `• ${line}`;
      }
      return line;
    });
    setInputValue(formattedLines.join('\n'));
  };

  const MyContainer = ({ className, children }) => {
    const handleSwitchChange = checked => {
      setIsCurrentlyWorking(checked);
      if (checked) {
        setEndDate(new Date());
      }
    };
    return (
      <div style={{}}>
        <CalendarContainer className={className}>
          <div style={{ position: 'relative' }}>{children}</div>
          <div>
            <div className="mt-20" style={{ backgroundColor: '#fbfbfb' }}>
              <Switch
                className="mr-5"
                size="small"
                checked={isCurrentlyWorking}
                onChange={handleSwitchChange}
              />
              Currently work here {isCurrentlyWorking ? 'Yes' : 'No'}
            </div>
            <div className="mt-5" />
          </div>
        </CalendarContainer>
      </div>
    );
  };

  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <input className="inputEl" onClick={onClick} ref={ref} value="Present"></input>
  ));

  return (
    <div className="" style={{ width: '842px' }}>
      <Form onFinish={handleSubmit} form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="role"
          label={
            <label style={{}}>
              <span className="custom-text whitespace-nowrap">
                WHAT WAS YOUR <strong>ROLE</strong> AT THE COMPANY?
              </span>
            </label>
          }
        >
          <Input
            style={{
              color: '#283E50',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '600',
              lineHeight: '23.4px',
            }}
            class="inputEl experience-section inputEl st-current"
            id="experience-section-form-0"
            placeholder="Marketing Analyst"
          />
        </Form.Item>
        <Form.Item
          name="companyName"
          label={
            <label style={{}}>
              <span className="custom-text whitespace-nowrap">
                FOR WHICH <strong>COMPANY</strong> DID YOU WORK?
              </span>
            </label>
          }
        >
          <Input
            style={{}}
            class="inputEl experience-section inputEl st-current"
            id="experience-section-form-1"
            placeholder="Google"
          />
          {/* <Input style={stylesInput} placeholder="Google" /> */}
        </Form.Item>
        <Form.Item name="startDate" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="endDate" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Space.Compact style={{ width: '842px' }} block>
          <div style={{ width: '50%' }}>
            <Form.Item
              label={
                <label style={{}}>
                  <span className="custom-text whitespace-nowrap">
                    <strong>WHERE</strong> WAS THE COMPANY LOCATED?
                  </span>
                </label>
              }
            >
              <Space align="center">
                <div className="datepicker relative" style={{ marginLeft: '9px' }}>
                  <DatePicker
                    wrapperClassName=""
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    placeholderText={format(new Date(), 'MMMM yyyy')}
                  />
                   <Divider style={{ position: 'absolute', marginLeft: '97px' }} plain>
                  -
                </Divider>
                </div>
                <div style={{}}></div>
                
               
                <div style={{}}>
                  <DatePicker
                    dateFormat="MMMM yyyy"
                    selected={isCurrentlyWorking ? new Date() : endDate}
                    showMonthYearPicker
                    calendarContainer={MyContainer}
                    onChange={date => setEndDate(date)}
                    customInput={isCurrentlyWorking ? <ExampleCustomInput /> : null}
                    placeholderText={format(new Date(), 'MMMM yyyy')}
                  />
                </div>
              </Space>

              <Box className="flex datepicker relative"></Box>
            </Form.Item>
          </div>
          <div style={{ width: '50%' }}>
            <Form.Item
              name="location"
              label={
                <label style={{}}>
                  <span className="custom-text whitespace-nowrap">
                    <strong>WHERE</strong> WAS THE COMPANY LOCATED?
                  </span>
                </label>
              }
            >
              <Input
                style={{}}
                class="inputEl experience-section inputEl st-current"
                id="experience-section-form-1"
                placeholder="New York, NY"
              />{' '}
            </Form.Item>
          </div>
        </Space.Compact>

        <Form.Item
          name="description"
          style={{}}
          label={
            <label style={{}}>
              <span className="custom-text whitespace-nowrap">
                <strong>WHAT DID YOU DO</strong> AT THE COMPANY?
              </span>
            </label>
          }
        >
          <textarea
            className="inputEl undefined src-components-Form-Field--Es8ORQL2ofo= "
            id="experience-section-form-4"
            aria-label="**What did you do** at the company?"
            rows={5}
            placeholder="• Organised and implemented Google Analytics data tracking campaigns to maximize the effectiveness of email remarketing initiatives that were deployed using Salesforce's marketing cloud software."
            name="description"
            style={{
              fontWeight: '400',
              background: 'white',
              height: 120,
              height: 'auto',
              overflow: 'hidden',
              resize: 'none',
            }}
            ref={inputRef}
            onKeyPress={handleKeyPress}
            onChange={handleInputChange}
            onInput={handleTextareaInput}
            value={inputValue}
          />

          {/* <textarea
            className="inputEl text-area"
            style={stylesInput4}
            placeholder="• Organized and implemented Google Analytics data tracking campaigns to maximize the effectiveness of email remarketing initiatives that were deployed using Salesforce's marketing cloud software."
            ref={inputRef}
            onKeyPress={handleKeyPress}
            onChange={handleInputChange}
            value={inputValue}
            contentEditable="true"
          /> */}
          <Input type="hidden" value={inputValue} />
          {/* <Input
            className="inputEl"
            style={stylesInput4}
            placeholder="• Organised and implemented Google Analytics data tracking campaigns to maximize the effectiveness of email remarketing initiatives that were deployed using Salesforce's marketing cloud software."
            onInput={handleDescriptionChange}
          /> */}
        </Form.Item>

        <Button
          htmlType="submit"
          className="form-button w-full w-[769.22px] h-[47.86px] pl-[313.83px] pr-[315.39px] pt-[17.26px] pb-[17.60px] bg-indigo-500 rounded-md justify-center items-center inline-flex hover:text-white"
          style={{
            width: '842.22px',
            height: '47.86px',
            backgroundColor: 'rgb(77, 112, 235)',
            color: 'white',
          }}
        >
          <div className="hover:text-white text-center text-white text-opacity-80 text-xs font-bold font-['Source Sans Pro'] uppercase leading-3 whitespace-nowrap">
            {isEditMode ? 'UPDATE ' : 'SAVE TO EXPERIENCE LIST'}
          </div>
        </Button>
      </Form>
    </div>
  );
};
export default ExperienceForm;
