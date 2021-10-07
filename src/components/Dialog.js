import React, { Component } from "react";
import { getDialogContainer } from "../utils";
import * as RB from 'react-bootstrap';
import { ReactBridge } from "../ReactBridge";
import FastState from "faststate-react";
import Portal from "./Portal";
import { v4 as uuid } from 'uuid';
import Loading from './Loading';
import { translate } from '../utils'
import { Field } from './Field'
import { DynoState } from 'faststate-react/states/DynoState'

/**
 * @member {string} id
 * @member {Component|string} title
 * @member {Component|string} content
 * @member {Component[]} actions
 * @member {"sm"|"lg"|"xl"} size
 * @member {bool} showClose
 * @member {bool} disableBackdropClick
 * @member {bool} isOpen
 * @member {Function} setOpen
 * @member {Function} onClose
 * @member {bool} isLoading
 * @member {Function} setLoading
 */
export class FastDialog {
    /**
     * 
     * @param {FastDialog} initial 
     */
    constructor(initial) {
        this.id = uuid();
        this.title = initial.title;
        this.content = initial.content;
        this.actions = initial.actions;
        this.isOpen = initial.isOpen;
        this.isLoading = initial.isLoading;
        this.setLoading = initial.setLoading;
        this.showClose = initial.showClose;
        this.onClose = initial.onClose;
        this.size = initial.size || "sm";
        this.skipRendering = false;
        if (initial.showClose === undefined) {
            this.showClose = true;
        }
        this.disableBackdropClick = initial.disableBackdropClick === true;
    }

    /**
     * 
     * @param {FastDialog} initial 
     */
    static async create(initial) {
        const dlg = new FastDialog(initial);
        const container = getDialogContainer();
        dlg.setOpen = (async (v) => {
            const container = getDialogContainer();
            container.dialogs = container.dialogs.map(item => {
                if (item.id === dlg.id) {
                    item.isOpen = v;

                    if (v === false) {
                        if (item.onClose) {
                            item.onClose.call(item);
                        }
                        setTimeout(async () => {
                            container.dialogs = container.dialogs.map(item => {
                                if (item.id === dlg.id) {
                                    item.skipRendering = true;
                                }
                                return item;
                            });
                            await getDialogContainer().update();
                        }, 400);
                    }
                    else {
                        item.skipRendering = false;
                    }
                }
                return item;
            });
            await getDialogContainer().update();
        }).bind(dlg);
        dlg.setLoading = (async (v) => {
            const container = getDialogContainer();
            container.dialogs = container.dialogs.map(item => {
                if (item.id === dlg.id) {
                    item.isLoading = v;
                }
                return item;
            });
            await getDialogContainer().update();
        }).bind(dlg);

        await FastState.setState(container, {
            dialogs: [...container.dialogs, dlg]
        });
        return dlg;
    }

    static async showYesNo({ title, message, size, onYes, onNo, onClose, disableBackdropClick }) {
        var dlg = await FastDialog.create({
            title: title,
            content: message,
            size: size,
            onClose: onClose,
            disableBackdropClick: disableBackdropClick,
            actions: [
                ({ dialog }) => {
                    return <Field onClick={async (evt) => {
                        dialog.setLoading(true);
                        if (onNo) {
                            var r = onNo(evt, dialog);
                            if (r instanceof Promise) await r.catch(console.error);
                        }
                        dialog.setLoading(false);
                        dialog.setOpen(false);
                    }} type="button" color="default" outline style={{ minWidth: 70 }} title="DIALOG.NO"></Field>
                },
                ({ dialog }) => {
                    return <Field onClick={async (evt) => {
                        dialog.setLoading(true);
                        if (onYes) {
                            var r = onYes(evt, dialog);
                            if (r instanceof Promise) await r.catch(console.error);
                        }
                        dialog.setLoading(false);
                        dialog.setOpen(false);
                    }} type="button" color="primary" style={{ minWidth: 70 }} title="DIALOG.YES"></Field>
                }
            ]
        });
        dlg.setOpen(true);
    }
    static async showInput({ title, message, size, onYes, onNo, onClose, disableBackdropClick, inputProps, inputTitle }) {
        var state = new DynoState();

        var dlg = await FastDialog.create({
            title: title,
            content: ((props) => {
                const [index, setIndex] = React.useState(0);
                if (!this.forceUpdate) {
                    this.forceUpdate = () => {
                        setIndex(index + 1);
                    };
                }

                return <div>
                    {message}

                    <Field {...inputProps} title={inputTitle} type="text" value={state.value(this, 'inputValue')} onChange={(value) => {
                        state.value(this, 'inputValue').write(value);
                        setIndex(index + 1);
                    }}></Field>
                </div>
            }),
            size: size,
            onClose: onClose,
            disableBackdropClick: disableBackdropClick,
            actions: [
                ({ dialog }) => {
                    return <Field onClick={async (evt) => {
                        if (onYes) {
                            var r = onYes(evt, dialog);
                            if (r instanceof Promise) await r.catch(console.error);
                        }
                    }} type="button" color="primary" style={{ minWidth: 70 }} title="DIALOG.YES"></Field>
                }
            ]
        });
        dlg.state = state;
        dlg.setOpen(true);
    }
}

export class FastDialogContainer extends Component {
    componentDidMount() {
        getDialogContainer().register(this);
    }
    render() {
        const container = getDialogContainer();
        /**
         * @type {FastDialog[]}
         */
        const dialogs = container.dialogs;
        return <ReactBridge>
            {dialogs && Array.isArray(dialogs) && dialogs.filter(p => !p.skipRendering).map((dialog, index) => {
                const DialogTitle = typeof dialog.title === 'string' ? () => <h6>{translate(dialog.title)}</h6> : dialog.title;
                const DialogContent = typeof dialog.content === 'string' ? () => { return translate(dialog.content); } : dialog.content;
                const DialogActions = dialog.actions;

                return <Portal key={index} portal_id={dialog.id} onClick={(!dialog.disableBackdropClick ? (evt) => {
                    if (evt.target) {
                        if (evt.target.getAttribute("portal_id") === dialog.id) {
                            dialog.setOpen(false);
                        }
                    }
                } : null)} style={{
                    transition: 'all 0.3s',
                    overflowY: 'auto',
                    ...(dialog.isOpen ? {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        pointerEvents: 'auto'
                    } : {
                        backgroundColor: 'transparent',
                        pointerEvents: 'none'
                    })
                }}>
                    <RB.Modal.Dialog size={dialog.size} style={{
                        transition: 'all 0.3s cubic-bezier(.9,.01,.01,.9)',
                        ...(dialog.isOpen ? {
                            display: 'block',
                            opacity: 1,
                            transform: 'translateY(0)',
                            pointerEvents: 'auto'
                        } : {
                            opacity: 0,
                            transform: 'scale(0.9) translateY(10px)',
                            pointerEvents: 'none'
                        })
                    }} show={dialog.isOpen}>
                        <Loading show={dialog.isLoading} />
                        {DialogTitle && <RB.Modal.Header>
                            <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                    <DialogTitle dialog={dialog} />
                                </div>
                                <div style={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    fontWeight: 'bold',
                                }} onClick={() => {
                                    dialog.setOpen(false);
                                }}>
                                    <i className="bi bi-x-lg text-dark"></i>
                                </div>
                            </div>

                        </RB.Modal.Header>}
                        {DialogContent && <RB.Modal.Body>
                            <DialogContent dialog={dialog} />
                        </RB.Modal.Body>}
                        {DialogActions && Array.isArray(DialogActions) ? (<RB.Modal.Footer>
                            {DialogActions && DialogActions.map((Action, index) => {
                                return <Action key={index} dialog={dialog} />
                            })}
                        </RB.Modal.Footer>
                        ) : null}
                    </RB.Modal.Dialog>
                </Portal>
            })
            }
        </ReactBridge>;
    }
}