import React from 'react'
import { Link, Outlet, useLoaderData, useMatch } from 'react-router-dom'
import Sidebar from './sidebar'
import Header from './header'
import Courses from '../pages/manager/home/courses'
import Student from '../pages/manager/home/students'
import Students from '../pages/manager/home/students'
import PropTypes from 'prop-types'
export default function LayoutDashboard({isAdmin=true}) {
const session=useLoaderData()

    const isManagerPreviewPage = useMatch('/manager/courses/:id/preview')
    const isStudentPreviewPage = useMatch('/student/detail-course/:id')
   
    return (
        <>
            {isManagerPreviewPage !== null || isStudentPreviewPage !== null ? (
                <Outlet />
            ) : (
                <div className="flex min-h-screen">
                    <Sidebar isAdmin={isAdmin}/>
                    <main className="flex flex-col flex-1 gap-[30px] p-[30px] ml-[290px]">
                        <Header type={session.role} />
                        <Outlet />
                    </main>
                </div>
            )}
        </>
    )
}

LayoutDashboard.prototype={
    isAdmin : PropTypes.bool
}