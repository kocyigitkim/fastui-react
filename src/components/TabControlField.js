import React, { Component } from 'react'
import { translate } from '../utils';
import { CustomField } from './Form'

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
        this.setState({ tabIndex: index });
    }
    render() {
        const { vertical, filled, pages } = this.props;
        if (vertical === true) {
            return (
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-3">
                        <ul className="nav flex-column nav-pills">
                            {pages.map((page, index) => (
                                <li className='nav-item' key={index}>
                                    <a style={{ userSelect: 'none', cursor: 'pointer' }} className={`nav-link ${index === this.state.tabIndex && 'active'}`} onClick={() => { this.setTab.call(this, index) }}>{translate(page.name)}</a>
                                </li>
                            ))}

                        </ul>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-9">
                        <div className="tab-content">
                            {pages.map((page, index) => {
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
                                <a style={{ userSelect: 'none', cursor: 'pointer' }} className={`nav-link ${index === this.state.tabIndex && 'active'}`} onClick={() => { this.setTab.call(this, index) }}>{translate(page.name)}</a>
                            </li>
                        ))}

                    </ul>
                    <div className="tab-content" style={{ marginTop: -5 }}>
                        {pages.map((page, index) => {
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
            )
        }
    }
}
