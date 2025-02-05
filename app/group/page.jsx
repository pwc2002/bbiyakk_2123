"use client"

import FullCalendar from '@/components/FullCalendar';
import Link from 'next/link';
import Checklist from '@/components/checklist';
import Category from '@/components/Category';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {CircularProgress} from "@nextui-org/react";
import React from "react";
import { usePledge } from '@/context/PledgeContext';

export default function GroupPage() {
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [isCategoryVisible, setIsCategoryVisible] = useState(true);
    const [showTitle, setShowTitle] = useState("");
    const touchStartX = useRef(0);
    const router = useRouter();
    const { data: session } = useSession();
    const [events, setEvents] = useState([]);
    const [virtualdata, setVirtualdata] = useState([]);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [selectedDays, setSelectedDays] = useState([]);
    const { globalPledge, setGlobalPledge } = usePledge();
    const [pledge, setPledge] = useState(globalPledge);
    const [progress, setProgress] = React.useState(75); // 원하는 진행률 값 (0-100)
    const [selectedGroup, setSelectedGroup] = useState(new Set(["전체"]));
    const [showModal, setShowModal] = useState(false);

    const selectedValue = React.useMemo(
        () => Array.from(selectedGroup).join(', ').replace(/_/g, ''),
        [selectedGroup],
    );

    const days = ['일', '월', '화', '수', '목', '금', '토'];

    const toggleDay = (day) => {
        setSelectedDays(prev => 
            prev.includes(day) 
                ? prev.filter(d => d !== day) 
                : [...prev, day]
        );
    };

    useEffect(() => {
        //console.log("Session data:", session);
        if(session == null){
        router.push('/login');
        }
    }, [session]);

    const toggleChecklist = () => {
        setIsChecklistOpen((prev) => !prev);
        setIsCategoryVisible(true);
    };

    const closeChecklist = () => {
        if (isChecklistOpen) {
        setIsChecklistOpen(false);
        setIsCategoryVisible(true);
        }
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        const touchEndX = e.touches[0].clientX;
        if (touchStartX.current - touchEndX > 50) { // 왼쪽으로 50px 이상 밀면
        closeChecklist();
        }
    };

    useEffect(()=>{
        //console.log("events:2", events);
        //console.log("virtualdata:2", virtualdata);
    const calculateProgress = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 이번달 virtualdata 개수 계산
        const thisMonthVirtualData = virtualdata.filter(data => {
            const dataDate = new Date(data.start);
            return dataDate.getMonth() === currentMonth && dataDate.getFullYear() === currentYear;
        }).length;

        // 이번달 events 개수 계산 
        const thisMonthEvents = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        }).length;

        // 진행률 계산 (events / virtualdata * 100)
        const calculatedProgress = thisMonthVirtualData === 0 ? 0 : Math.round((thisMonthEvents / thisMonthVirtualData) * 100);
        
        setProgress(calculatedProgress);
    };

    calculateProgress();
    }, [virtualdata, events]);



    const handleReset = (onClose) => {
        if (pledge.trim()) {  // 입력값이 있을 때만 저장
            setGlobalPledge(pledge); // 전역 상태 업데이트
            localStorage.setItem('pledge', pledge); // localStorage에도 직접 저장
            onClose();
        }
    };

    return (
        <div className='w-full h-full mb-[10px] pt-48' onClick={closeChecklist}>
        <div className="absolute top-0 left-0 flex items-start gap-4 mb-6 mt-4 px-8 pl-10 pt-10">
            {/* <Avatar
            className='w-[80px] h-[80px]'
            src={session?.user?.image}
            onClick={() => {
                if (session) {
                router.push('/settings');
                } else {
                router.push('/login');
                }
            }}
            /> */}
            <CircularProgress
                className="w-[100px] h-[100px] pb-7"
                aria-label="Progress"
                color="blue"
                showValueLabel={true}
                value={progress}
                size="lg"
                classNames={{
                    svg: "w-[80px] h-[80px]",
                    value: "text-xl font-semibold",
                }}
            />

            <div className="flex flex-col">
                <div className="flex items-center gap-16">
                    <span className="text-2xl font-semibold">
                        {session?.user?.name || "게스트"}
                    </span>
                    <Button 
                        className="border-none bg-gray-200 rounded-xl h-8 px-2" 
                        onPress={onOpen}
                    >
                        소모임 설정
                    </Button>
                </div>
                <div>
                    <p id="dazim">
                      {(() => {
                        switch(selectedValue) {
                          case '북북독서왕':
                            return '주 3일 월, 수, 금';
                          case 'running': 
                            return '주 2일 화, 목';
                          case '영어 배우쟈':
                            return '주 2일 토, 일';
                          default:
                            return '주 2일 화,금';
                        }
                      })()}
                    </p>
                </div>
                <Dropdown>
                    <DropdownTrigger>
                        <span className="text-sm text-gray-500 cursor-pointer">
                            {selectedValue} ▼
                        </span>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Calendar Actions"
                        selectedKeys={selectedGroup}
                        onSelectionChange={setSelectedGroup}
                        selectionMode="single"
                        
                    >
                        <DropdownItem key="북북독서왕">북북독서왕</DropdownItem>
                        <DropdownItem key="running">running</DropdownItem>
                        <DropdownItem key="영어 배우쟈">영어 배우쟈</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            
        </div>

        {/* <Image
            src="/menu.png"
            alt="menu"
            width={25}
            height={25}
            onClick={(e) => {
            e.stopPropagation();
            toggleChecklist();
            }}
            className='absolute top-3 left-6 cursor-pointer'
        /> */}
        
        <div
            className={`absolute top-0 left-0 h-full w-full bg-white transition-transform transform ${isChecklistOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            <div className="p-5">
            {isCategoryVisible ? (
                <Category toggleChecklist={toggleChecklist} setIsCategoryVisible={setIsCategoryVisible} setShowTitle={setShowTitle} />
            ) : (
                <Checklist toggleChecklist={toggleChecklist} setIsCategoryVisible={setIsCategoryVisible} showTitle={showTitle} setEvents={setEvents} events={events}/>
            )}
            </div>
        </div>
        <FullCalendar setEvents={setEvents} events={events} virtualdata={virtualdata} setVirtualdata={setVirtualdata}/>

        {/* <div className="flex justify-center">
            <FullCalendar setEvents={setEvents} events={events}/>
        </div> */}

        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            placement="center"
            size="lg"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col">
                            <p className="text-2xl">영어 배우쟈의 설정 변경</p>
                            <p className="text-sm text-gray-200">소모임 별 각오와 참여 요일을 변경할 수 있어요!</p>
                        </ModalHeader>
                        <ModalBody>
                            <fieldset className="border-gray-400 border-1">
                                <legend className="font-bold"> 다짐</legend>
                                <form>
                                    <input 
                                        placeholder="입력해주세요." 
                                        className="ml-3 pl-2 pb-2 mb-1 w-72 pt-2"
                                        value={pledge}
                                        onChange={(e) => setPledge(e.target.value)}
                                        maxLength={25}
                                    ></input>
                                </form>
                            </fieldset>
                            <p className="text-sm text-gray-300">- 최대 25글자까지만 입력 가능해요.</p> 
                            <div>
                                <p className="font-bold mb-3">참여요일</p>
                                <div className="flex justify-between gap-2">
                                    {days.map((day) => (
                                        <Button
                                            key={day}
                                            className={`rounded-full w-10 h-10 min-w-0 ${
                                                selectedDays.includes(day)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-400'
                                            }`}
                                            onPress={() => toggleDay(day)}
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <fieldset className="border-gray-400 border-1">
                                <legend className="font-bold"> 이모지</legend>
                                <form>
                                    <input className="ml-3 pl-2 pb-2 mb-1 w-72 pt-2"></input>
                                </form>
                            </fieldset>
                        </ModalBody>
                        <ModalFooter className="flex justify-center pb-6">
                            <Button 
                                className={`rounded-xl w-full ${
                                    pledge.trim() 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-400 text-white'
                                }`}
                                onPress={() => handleReset(onClose)}
                                isDisabled={!pledge.trim()}
                            >
                                재설정
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
        <div className='absolute bottom-16 right-3 w-14 h-14 bg-blue-500 rounded-full z-40 text-2xl font-bold text-white flex justify-center items-center'
            onClick={()=>{
                setShowModal(true);
            }}
        >
            C
        </div>
        {showModal && (
        <div className='absolute top-0 left-0 w-full h-full bg-red-500 z-50'>
            <div className='flex flex-col w-full h-screen bg-white relative'>
                <div className='flex w-full justify-end'>
                    <button 
                        className='w-10 h-10 bg-gray-200 rounded-full'
                        onClick={()=>{
                            setShowModal(false);
                        }}
                    >X</button>
                </div>
                <div className='flex w-full justify-start mb-4'>
                    <div id='partner-messagebox' className=' bg-gray-200 pl-4 mb-2 ml-4 h-12 rounded-xl text-xl pr-4 flex items-center'>
                        <p>오늘도 수고하셨어요~!</p>
                    </div>
                </div>
                <div className='flex w-full justify-end mb-4'>
                    <div id='my-messagebox' className='h-12 bg-blue-400 text-white pr-4 mr-4 mb-2 text-end rounded-xl text-xl pl-4 flex items-center'>
                        <p>님은 왜 수고 안해요;;</p>
                    </div>
                </div>
                <div className='flex w-full justify-start mb-4'>
                    <div id='partner-messagebox' className=' bg-gray-200 pl-4 mb-2 ml-4 h-12 rounded-xl text-xl pr-4 flex items-center'>
                        <p>미안요,,^^;;</p>
                    </div>
                </div>
                <div className='flex w-full justify-end mb-4'>
                    <div id='my-messagebox' className='h-12 bg-blue-400 text-white pr-4 mr-4 mb-2 text-end rounded-xl text-xl pl-4 flex items-center'>
                        <p>아니에요 수고하셨어요!! ㅎㅎ</p>
                    </div>
                </div>
                <div className='flex w-full justify-start mb-4'>
                    <div id='partner-messagebox' className=' bg-gray-200 pl-4 mb-2 ml-4 h-12 rounded-xl text-xl pr-4 flex items-center'>
                        <p>내일은 더 힘차게 같이 해봐요!!</p>
                    </div>
                </div>
                <div className='flex w-full justify-end mb-4'>
                    <div id='my-messagebox' className='h-12 bg-blue-400 text-white pr-4 mr-4 mb-2 text-end rounded-xl text-xl pl-4 flex items-center'>
                        <p>네 좋아요~! 내일 뵈어요!</p>
                    </div>
                </div>
                <div className='flex w-full justify-start mb-4'>
                    <div id='partner-messagebox' className=' bg-gray-200 pl-4 mb-2 ml-4 h-12 rounded-xl text-xl pr-4 flex items-center'>
                        <p>내일 같이 점심 드시는건 어떤가요?</p>
                    </div>
                </div>
                <div className='flex w-full justify-end mb-4'>
                    <div id='my-messagebox' className='h-12 bg-blue-400 text-white pr-4 mr-4 mb-2 text-end rounded-xl text-xl pl-4 flex items-center'>
                        <p>네 같이 먹죠~!</p>
                    </div>
                </div>
                <div className='absolute bottom-0 left-0 w-full h-11 items-center justify-center flex flex-row'>
                    <input className='w-full h-full bg-gray-200 rounded-xl'></input>
                    <button className='w-10 h-10 bg-gray-200 rounded-full'>전송</button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
    }
