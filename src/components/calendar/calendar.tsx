import React, {useEffect, useState} from 'react';
import axios from 'axios';
import CalendarHeader from './header';
import CalendarWeek from './week';
import CalendarDays from './days';
import SideSchedule from './side-schedule';
import formatter from '../../utils/formatter.util'
import {holidayDto} from '../../Dto/calendar.dto';
import {scheduleDto} from '../../Dto/schedule.dto'

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [holiday, setHoliday] = useState<holidayDto[]>([]);
    const [scheduleList, setScheduleList] = useState<scheduleDto[]>([]);
    const [startDay, setStartDay] = useState('');
    const [loadData, setLoadData] = useState(false);
    const [showSideSchedule, setShowSideSchedule] = useState(false);
    const [changeSchedule, setChangeSchedule] = useState(false);
    const defaultSchedule = {
        id: 0,
        title: '',
        startday: startDay,
        starttime: '00:00',
        endtime: '00:00',
        memo: ''
    }
    const [schedule, setSchedule] = useState<scheduleDto>(defaultSchedule);

    async function getScheduleList() {
        try {
            const params = {
                targetDay: currentMonth.getFullYear() + '-' + (currentMonth.getMonth() + 1)
            }

            const response = await axios.get('http://localhost:8080/api/schedule', {params});
            setScheduleList(response.data);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async function getDate() {
        try {
            const params = {
                ServiceKey: process.env.REACT_APP_DATA_GO_KR_API_KEY,
                solYear: currentMonth.getFullYear(),
                solMonth: ("0" + (currentMonth.getMonth() + 1)).slice(-2)
            }

            const response = await axios.get('https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo', {params});

            const holidayData = response.data.response.body.items.item;

            let holidayList = [];
            if (holidayData) {
                if (!Array.isArray(holidayData)) {
                    holidayList.push(holidayData);
                } else {
                    holidayList = holidayData;
                }
            }

            setHoliday(holidayList || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadData(true);
        }
    }

    async function handleSubmitSchedule(schedule: scheduleDto) {
        try {
            const response = await axios.post('http://localhost:8080/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: schedule
            })

            setChangeSchedule((prev) => !prev);

            const result = await response.data;
            console.log('Post successful:', result);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function handleChangeSchedule(schedule: scheduleDto) {
        try {
            const response = await axios.put('http://localhost:8080/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: schedule
            })

            setChangeSchedule((prev) => !prev);

            const result = await response.data;
            console.log('Post successful:', result);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function handleDeleteSchedule(id: number) {
        try {
            const params = {
                id: id
            }

            const response = await axios.delete('http://localhost:8080/api/schedule', {params});
            setShowSideSchedule(false);
            setChangeSchedule((prev) => !prev);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async function handleDetailSchedule(id: number) {
        try {
            const params = {
                id: id
            }

            const response = await axios.get('http://localhost:8080/api/schedule/detail', {params});
            setSchedule(response.data);

            setStartDay(formatter('dayFormatter', response.data.startday));
            setShowSideSchedule(true);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function handleChangeMonth(newMonth: Date) {
        setShowSideSchedule(false);
        setCurrentMonth(newMonth);
    }

    function handleClickDay(id: Date) {
        setShowSideSchedule(false);
    }

    function handleCreateSchedule(id: Date) {
        let startDay = formatter('dayFormatter', id.toString())
        setSchedule(defaultSchedule);
        setStartDay(startDay);
        setShowSideSchedule(true);
    }

    function handleCloseButton() {
        setShowSideSchedule(false);
    }

    useEffect(() => {
        setLoadData(false);
        getDate();
        getScheduleList();
    }, [currentMonth]);

    useEffect(() => {
        getScheduleList();
    }, [changeSchedule, showSideSchedule]);

    return (
        <div className="container">
            <CalendarHeader
                dataParams={
                    {month: currentMonth}}
                changedMonth={handleChangeMonth}
            />
            <div className="calendar-container">
                <div className="calendar">
                    <CalendarWeek/>
                    {loadData && (
                        <CalendarDays
                            dataParams={
                                {
                                    month: currentMonth,
                                    holidayList: holiday,
                                    scheduleList: scheduleList
                                }}
                            handleClickDay={handleClickDay}
                            handleCreateSchedule={handleCreateSchedule}
                            handleDetailSchedule={handleDetailSchedule}
                            handleDeleteSchedule={handleDeleteSchedule}
                        />
                    )}
                </div>
                <SideSchedule
                    dataParams={
                        {
                            show: showSideSchedule,
                            startday: startDay,
                            scheduleData: schedule
                        }}
                    handleCloseButton={handleCloseButton}
                    handleSubmitSchedule={handleSubmitSchedule}
                    handleModifySchedule={handleChangeSchedule}
                    handleDeleteSchedule={handleDeleteSchedule}/>
            </div>
        </div>
    )
}