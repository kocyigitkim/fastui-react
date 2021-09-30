import React, { Component } from 'react'
import { getRouteStatus, translate, redirectTo } from '../utils';
import { CustomField } from "./CustomField";
import { RouteBuilder } from '../RouteBuilder';

export default class TabControlField extends CustomField {
    state = {
        tabIndex: 0
    }
    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0
        };
    }
    setTab(index) {
        var pages = this.props.pages.filter(p => p !== undefined && p !== null);
        var page = pages[index];
        if (page && page.route) {
            var result = getRouteStatus(page.route, null, true, false);
            if (result && result.isReset) {
                var loc = RouteBuilder.location();
                for (var i = loc.routes.length - 1; i >= 0; i--) {
                    var lroute = loc.routes[i];
                    if (lroute.className === result.b[0]) {
                        loc.routes = loc.routes.slice(0, i + 1);
                        break;
                    }
                }
                redirectTo(loc.build());
            }
            else {
                redirectTo(RouteBuilder.location().setAction(page.route, "list").build());
            }
        }
        else {
            this.setState({ tabIndex: index });
        }
    }
    render() {
        const { vertical, filled } = this.props;
        var pages = this.props.pages.filter(p => p !== undefined && p !== null);
        var tabIndex = this.state.tabIndex;
        var matchedPage = null;
        var pageIndex = 0;
        var isMatchedRoot = false;
        for (var p of pages) {
            var result = getRouteStatus(p.route, "list", true, false);
            if (result.isMatched) {
                matchedPage = { result, i: pageIndex };
                if (result.b.length === 1) isMatchedRoot = true;
                if (!isMatchedRoot)
                    break;
            }
            pageIndex++;
        }
        if (matchedPage) {
            tabIndex = matchedPage.i;
        }

        if (vertical === true) {
            return (
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-3">
                        <ul className="nav flex-column nav-pills">
                            {pages.map((page, index) => (
                                <li className='nav-item' key={index}>
                                    <a style={{ userSelect: 'none', cursor: 'pointer' }} className={`nav-link ${index === tabIndex && 'active'}`} onClick={() => { this.setTab.call(this, index) }}>{translate(page.name)}</a>
                                </li>
                            ))}

                        </ul>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-9">
                        <div className="tab-content">
                            {pages.map((page, index) => {
                                if (index !== tabIndex) {
                                    return <div></div>;
                                }
                                const TabContent = page.content;
                                return (
                                    <div key={index} className={"tab-pane" + (index === this.state.tabIndex ? ' active' : '')} id={page.id}>
                                        <div className="card card-block">
                                            <div className="card-body"><TabContent></TabContent></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>
                    <ul className={`nav nav-pills ${filled ? 'nav-fill' : ''}`}>
                        {pages.map((page, index) => (
                            <li className='nav-item' key={index}>
                                <a style={{ userSelect: 'none', cursor: 'pointer' }} className={`nav-link ${index === tabIndex && 'active'}`} onClick={() => { this.setTab.call(this, index) }}>{translate(page.name)}</a>
                            </li>
                        ))}

                    </ul>
                    <div className="tab-content" style={{ marginTop: -5 }}>
                        {pages.map((page, index) => {
                            const TabContent = page.content;
                            return (
                                <div key={index} className={"tab-pane" + (index === tabIndex ? ' active' : '')} id={page.id}>
                                    <div className="card card-block">
                                        <div className="card-body"><TabContent></TabContent></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
        }
    }
}
