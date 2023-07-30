import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    repos: [],
    activity: [],
    contributorActivity: [],
    loading: false,
    chartLoading: false
};

const slice = createSlice({
    name: "repos",
    initialState,
    reducers: {
        startLoading(state) {
            state.loading = true;
        },
        startChartLoading(state) {
            state.chartLoading = true;
        },
        setRepos(state, action) {
            state.repos = action.payload;
            state.loading = false;
        },
        setCommit(state, action) {
            state.activity = action.payload;
            state.chartLoading = false;
        },
        setActivity(state, action) {
            state.activity = action.payload;
            state.chartLoading = false;
        },
        setActivityByContributor(state, action) {
            state.contributorActivity = action.payload;
            state.chartLoading = false;
        }
    },
});
export const { reducer } = slice;

export const getRepos = ({date,page}) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    const { data } = await axios.get(
        `https://api.github.com/search/repositories?q=created:>${date}&sort=stars&order=desc&page=${page}`
    );
    dispatch(slice.actions.setRepos(data.items));
};
export const getActivity = ({owner, repo, isCommit = true}) => async (dispatch) => {
    dispatch(slice.actions.startChartLoading());
    const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/stats/${isCommit ? 'commit_activity' : 'code_frequency'}`
    );
    dispatch(slice.actions.setActivity(data || []));
}
export const getActivityByContributor = ({owner, repo}) => async (dispatch) => {
    dispatch(slice.actions.startChartLoading());
    const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/stats/contributors`
    );
    dispatch(slice.actions.setActivityByContributor(data || []));
}