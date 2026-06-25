import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosinstance";

const initialState={
    lectures:[],
    quizzes: []
}
 
export const getCourseLectures= createAsyncThunk("/course/lecture/get", async(cid)=>{
    try {
        console.log('Fetching lectures for courseId:', cid);
        const response = axiosInstance.get(`/course/${cid}`);
        toast.promise(response,{
            loading:"Fetching course lectures",
            success:"Lectures fetched successfully",
            error:"Failed to load the lectures"
        });
        const data = (await response).data;
        console.log('LectureSlice received data:', {
            lectures: data.lectures?.length,
            quizzes: data.quizzes?.length
        });
        return data;
    } catch (error) {
        console.error('Error fetching lectures:', error);
        toast.error(error?.response?.data?.message);
    }
});

export const addCourseLectures= createAsyncThunk("/course/lecture/add", async(data)=>{
    try {
        const formData = new FormData(); // Đã sửa tên biến cho chuẩn
        formData.append("lecture", data.lecture);
        formData.append("title", data.title);
        formData.append("description", data.description);
        
        // Đã thêm /lectures vào cuối đường dẫn API
        const response = axiosInstance.post(`/course/${data.id}/lectures`, formData);
        toast.promise(response,{
            loading:"Adding course lecture",
            success:"Lectures added successfully",
            error:"Failed to add the lectures"
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteCourseLecture= createAsyncThunk("/course/lecture/delete", async(data)=>{
    try {

        const response = axiosInstance.delete(`/course/${data.courseId}/lectures/${data.lectureId}`);
        toast.promise(response,{
            loading:"Delete course lecture",
            success:"Lecture delete successfully",
            error:"Failed to delete the lectures"
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

const lectureSlice = createSlice({
    name:"lecture",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getCourseLectures.fulfilled,(state, action)=>{
            console.log('LectureSlice reducer: storing quizzes:', action?.payload?.quizzes?.length || 0);
            state.lectures=action?.payload?.lectures;
            state.quizzes=action?.payload?.quizzes || [];
        })
        .addCase(addCourseLectures.fulfilled,(state, action)=>{
            state.lectures=action?.payload?.lectures;
        })
    }

})
export default lectureSlice.reducer;