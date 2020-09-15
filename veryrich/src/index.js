import React from 'react'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import reportModel from './models/report'
import logger from 'redux-logger'

import mirror, { Router, Switch, render, Route } from 'mirrorx'

mirror.model(reportModel)
process.env.NODE_ENV === 'development' && mirror.defaults({
    middlewares : [logger]
})

render(
    <Router>
        <Switch>
            <Route path='/' component={App}/>
        </Switch>
    </Router>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
