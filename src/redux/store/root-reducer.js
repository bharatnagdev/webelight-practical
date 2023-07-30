import { combineReducers } from "@reduxjs/toolkit";
import { reducer as repoReducer } from "../slices/repos";
export const rootReducer = combineReducers({
    repos: repoReducer,
});