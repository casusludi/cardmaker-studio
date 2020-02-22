
import React from "react";
import './HTMLViewer.scss';
import { shell, remote } from 'electron';
import path from 'path';

export type HTMLViewerProps = {
    url: string | null | undefined
}

const webviewCSS = `
    
    /* scrollbar css : @see /styles/scrollbars.scss */
    ::-webkit-scrollbar {
        width: 8px; 
        height: 8px;
        background-color: rgb(29, 26, 26);
    }

    ::-webkit-scrollbar:hover {
        background-color: #2C2828;
    }

    ::-webkit-scrollbar-thumb {
        background: #bfb1b1;
        -webkit-border-radius: 100px;
    }
    ::-webkit-scrollbar-thumb:active {
        -webkit-border-radius: 100px;
    }

    ::-webkit-scrollbar-corner {
        background-color: rgb(29, 26, 26);
    }
`;


export class HTMLViewer extends React.Component<HTMLViewerProps>{

    private webviewRef: HTMLWebViewElement | null = null;

    onWebViewRef(ref: HTMLWebViewElement) {
        if (ref && !this.webviewRef) {
            this.webviewRef = ref;
            ref.addEventListener('dom-ready', (e) => {
                // @ts-ignore TS dont recognise webview API
                ref.insertCSS(webviewCSS)
                // @ts-ignore TS dont recognise webview API
                // ref.openDevTools({mode:'bottom'});
            })

            ref.addEventListener('console-message', (e: any) => {
                //console.log('[webview] :', e.message)
            })

            ref.addEventListener('ipc-message', (e: any) => {

                if (e.channel == 'webview-event-trap') {
                    const event = e.args[0];
                    const mouseEvent = new MouseEvent(event.type, {
                        clientX: event.clientX,
                        clientY: event.clientY,
                    });
                    document.dispatchEvent(mouseEvent)
                }
            })
        }
    }

    openViewInExternalbrowser() {
        if(this.props.url){
            shell.openExternal(this.props.url);
        }
    }

    webviewComp() {
        const preloadPath = path.join(remote.app.getAppPath(),'webview-preload.js');
        return <webview ref={this.onWebViewRef.bind(this)} preload={preloadPath} webpreferences="javascript=no, contextIsolation"  className="HTMLViewer_webview " src={this.props.url || undefined} ></webview>
    }

    render() {
        return (
            <div className="HTMLViewer full-space">
                {this.props.url ?
                    <React.Fragment>
                        <div className="HTMLViewer__ActionBar">
                            <button className="button" onClick={this.openViewInExternalbrowser.bind(this)}><i className="fas fa-external-link-alt"></i></button>
                        </div>
                        {this.webviewComp()}
                    </React.Fragment>
                    :
                    <div className="HTMLViewer__no">
                        No HTML to preview
                    </div>
                }

            </div>

        )
    }
}