import * as React from 'react'
import { DefinitionInput } from './definition-input'

export class RightSidebar extends React.Component<any, any> {

    render() {
        return (
            <div className="sidebar right">
                <div className="sidebar-group">
                    <DefinitionInput id="word-definition"/>
                    <DefinitionInput id="sentence-definition" tag="textarea"/>
                </div>
                <div className="sidebar-group">
                    <audio controls/>
                    <input type="number" step="0.1"/>
                    <input type="number" step="0.1"/>
                </div>
                <div className="sidebar-group">
                    <button>Previous Page</button>
                    <button>Next Page</button>
                </div>
                <div className="sidebar-group">
                    <button>Toggle Highlighting</button>
                </div>
            </div>
        )
    }

}