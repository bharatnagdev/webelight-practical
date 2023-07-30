import { Accordion, AccordionDetails, AccordionSummary, AppBar, Autocomplete, Avatar, Box, CircularProgress, LinearProgress, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from "@mui/material";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BugReport, Star } from "@mui/icons-material";
import { useDispatch, useSelector } from "../redux/store";
import { getActivity, getActivityByContributor, getRepos } from "../redux/slices/repos";
import ActivityChart from "./activityChart";
import { format, sub } from "date-fns";

export default function Repos() {
    const tableEl = useRef()
    const dispatch = useDispatch()
    const { repos, loading } = useSelector((state) => state.repos)
    const [filter, setFilter] = useState('1M')
    const [page, setPage] = useState(1);
    const [repoList, setRepoList] = useState(repos)
    const [selectedRepo, setSelectedRepo] = useState()
    const [shouldLoadMore, setLoadMore] = useState(true)
    const [distanceBottom, setDistanceBottom] = useState(0)
    const [expanded, setExpanded] = useState(false);
    const [chartOption, setChartOption] = useState('Commits')
    const handleExpand = (panel) => (event, isExpanded) => {
        if (isExpanded) {
            setChartOption('Commits')
            const record = repoList?.find((item) => item.id === panel)
            setSelectedRepo(record)
            dispatch(getActivity({owner: record.owner.login, repo: record.name}))
            dispatch(getActivityByContributor({owner: record.owner.login, repo: record.name}))
        }
        setExpanded(isExpanded ? panel : false);
    };

    useEffect(() => {
        setRepoList([].concat(repoList, repos))
        setLoadMore(false)
    }, [repos])
    useEffect(() => {
        if (!loading) {
            let date = new Date()
            console.log(filter);
            date = sub(date, {months: 1})
            if (filter === '2W') {
                date = sub(date, {weeks: 2})
            } else if (filter === '1W') {
                date = sub(date, {weeks: 1})
            } else {
                date = sub(date, {months: 1})
            }
            date = format(date, 'yyyy-MM-dd')
            dispatch(getRepos({ date, page }))
        }
    }, [page, filter])

    const loadMore = useCallback(() => {
        const loadItems = async () => {
            await new Promise(resolve =>
                setTimeout(() => {
                    setPage((prevState) => (prevState + 1))
                    resolve()
                }, 500)
            )
        }
        setLoadMore(true)
        loadItems()
    }, [repoList])

    const scrollListener = useCallback(() => {
        let bottom = tableEl.current.scrollHeight - tableEl.current.clientHeight
        // if you want to change distanceBottom every time new data is loaded
        // don't use the if statement
        if (!distanceBottom) {
            // calculate distanceBottom that works for you
            setDistanceBottom(Math.round(bottom * 0.2))
        }
        if (tableEl.current.scrollTop > bottom - distanceBottom && !shouldLoadMore && !loading) {
            loadMore()
        }
    }, [loadMore, shouldLoadMore, distanceBottom, loading])
    useLayoutEffect(() => {
        const tableRef = tableEl.current
        tableRef?.addEventListener('scroll', scrollListener)
        return () => {
            tableRef?.removeEventListener('scroll', scrollListener)
        }
    }, [scrollListener])

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        <a href="https://www.webelight.co.in/">Webelight</a>
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Most Starred Repos
                    </Typography>

                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={(event, newValue) => {
                            setRepoList([])
                            setPage(1)
                            setFilter(newValue)
                        }}
                        color="warning"
                        aria-label="Filter repos"
                    >
                        <ToggleButton value="1W" aria-label="1W">
                            <Typography>1W</Typography>
                        </ToggleButton>
                        <ToggleButton value="2W" aria-label="2W">
                            <Typography>2W</Typography>
                        </ToggleButton>
                        <ToggleButton value="1M" aria-label="1M">
                            <Typography>1M</Typography>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Toolbar>
            </AppBar>
            <Box sx={{ margin: 'auto', maxHeight: window.innerHeight - 75, overflow: 'scroll' }} ref={tableEl}>
                {
                    repoList?.map((row) => {
                        return <Accordion key={row.id} expanded={expanded === row.id} onChange={handleExpand(row.id)}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                                    <Avatar variant="rounded" src={row.owner?.avatar_url} sx={{ width: 84, height: 84 }} />
                                    <Stack spacing={2} alignItems="flex-start">
                                        <Typography variant="h4">{row.name}</Typography>
                                        <Typography variant="subtitle1">{row.description}</Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Typography sx={{ border: '1px solid', borderRadius: 1, alignItems: 'center', display: 'flex', p: 0.5 }}>
                                                <Star color="warning" /> {row.stargazers_count}
                                            </Typography>
                                            <Typography sx={{ border: '1px solid', borderRadius: 1, alignItems: 'center', display: 'flex', p: 0.5 }}>
                                                <BugReport color="error" /> {row.open_issues_count}
                                            </Typography>
                                            <Typography sx={{ alignItems: 'center', display: 'flex', p: 0.5 }}>
                                                Last pushed at {row.updated_at} by {row?.owner?.login}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={2} alignItems={'flex-end'}>
                                <Autocomplete
                                    disablePortal
                                    disableClearable
                                    id="combo-box-demo"
                                    options={[
                                        'Commits',
                                        'Addition',
                                        'Deletion'
                                    ]}
                                    value={chartOption}
                                    onChange={(event, newValue) => {
                                        setChartOption(newValue);
                                        dispatch(getActivity({owner: selectedRepo.owner.login, repo: selectedRepo.name, isCommit: newValue === 'Commits'}))
                                    }}
                                    sx={{ width: 300 }}
                                    renderInput={(params) => <TextField {...params} />}
                                    />
                                </Stack>
                                <ActivityChart addition={chartOption === 'Addition'} deletion={chartOption === 'Deletion'} />
                            </AccordionDetails>
                        </Accordion>
                    })
                }
            </Box>
            {loading && <LinearProgress sx={{ height: 10 }} />}
        </Paper>
    );
}