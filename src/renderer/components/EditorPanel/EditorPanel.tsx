import React from "react";
import TabNav, { TabNavItem } from "../Misc/TabNav/TabNav";
import "./EditorPanel.scss";
import { Project, ProjectConfig, RenderFilter } from "../../services/Project";
import ConfigEditor from "./ConfigEditor/ConfigEditor";
import { connect } from "react-redux";
import { ApplicationState } from "../..";
import { Dispatch } from "redux";
import { projectConfigChanged, projectFileChanged, projectRender } from "../../redux/project";
import _ from "lodash";
import { AppUIEditor } from "../App/App";
import { uiEditorSelectedTemplateChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedSourceTypeChanged } from "../../redux/ui";
import TemplateEditor from "./TemplateEditor/TemplateEditor";
import { ProjectSourceType } from "../../services/Project/Sources";
import { EditorPreferences, prefAutoRenderFilterChanged } from "../../redux/preferences";

export type EditorPanelProps = {
    project: Project | null
    width: number
    dispatch: Dispatch,
    ui: AppUIEditor,
    editorPreferences:EditorPreferences
}

function EditorPanel(props: EditorPanelProps) {

    function onConfigValidChange(config: ProjectConfig) {
        props.dispatch(projectConfigChanged({ config }));
    }

    function selectedTemplateChanged(e: React.ChangeEvent<HTMLSelectElement>) {
        if (props.project) {
            props.dispatch(uiEditorSelectedTemplateChanged({ template: props.project.templates[e.target.value] }))
        }
    }

    function selectedLayoutChanged(e: React.ChangeEvent<HTMLSelectElement>) {
        if (props.project) {
            props.dispatch(uiEditorSelectedLayoutChanged({ layout: props.project.layouts[e.target.value] }))
        }
    }

    function selectedSourceTypeChanged(e: React.ChangeEvent<HTMLSelectElement>) {

        props.dispatch(uiEditorSelectedSourceTypeChanged({ sourceType: e.target.value as ProjectSourceType }))

    }

    function onFileChanged(fileId: string, content: string) {
        props.dispatch(projectFileChanged({ fileId, content }));
    }

    function onProjectRender() {
        if(props.ui.selection){
            props.dispatch(projectRender({selection:props.ui.selection, filter: RenderFilter.ALL}));
        }
    }

    function onAutoRenderChanged(e: React.ChangeEvent<HTMLInputElement>){
        const filter = e.target.checked?RenderFilter.ALL:RenderFilter.NONE;
        props.dispatch(prefAutoRenderFilterChanged({autoRenderFilter:filter}))
    }

    return (
        <div className="EditorPanel full-space">
            {props.project ?
                <React.Fragment>
                    <TabNav className="EditorPanel__Tabs" >
                        <TabNavItem label="Config">
                            <ConfigEditor width={props.width} config={props.project.config} onValidChange={onConfigValidChange} />
                        </TabNavItem>
                        <TabNavItem label="Template">
                            <TemplateEditor width={props.width} template={props.ui.selection?.template} files={props.project.files} onFileChanged={onFileChanged} />
                        </TabNavItem>
                        <TabNavItem label="Layout">
                            <TemplateEditor width={props.width} template={props.ui.selection?.layout} files={props.project.files} onFileChanged={onFileChanged} />
                        </TabNavItem>

                    </TabNav>
                    <div className="EditorPanel__ActionBar">
                        {props.ui.selection && !props.ui.selection.data && 
                        <div className="MessagerAlert__error">
                                No data found in source <b>{props.ui.selectedSourceType}</b> for template <b>{props.ui.selection.template?.id}</b>
                        </div>}
                        <div className="ActionBar__TemplateSelect">
                            <label htmlFor="ActionBar__TemplateSelect">Template : </label>
                            <select id="ActionBar__TemplateSelect-select" defaultValue={props.ui.selection?.template?.id} onChange={selectedTemplateChanged}>
                                {_.map(props.project.templates, (o, k) => <option value={o.id} key={o.id}>{o.id}</option>)}
                            </select>
                        </div>
                        <div className="ActionBar__LayoutSelect">
                            <label htmlFor="ActionBar__LayoutSelect-select">Layout : </label>
                            <select id="ActionBar__LayoutSelect-select" defaultValue={props.ui.selection?.layout?.id} onChange={selectedLayoutChanged}>
                                {_.map(props.project.layouts, (o, k) => <option value={o.id} key={o.id}>{o.id}</option>)}
                            </select>
                        </div>
                        <div className="ActionBar__SourceSelect">
                            <label htmlFor="ActionBar__SourceSelect-select">Source : </label>
                            <select id="ActionBar__SourceSelect-select" defaultValue={props.ui.selectedSourceType} onChange={selectedSourceTypeChanged}>
                                {_.map(ProjectSourceType, (o, k) => <option value={o} key={o}>{o}</option>)}
                            </select>
                        </div>
                      
                        <div className="ActionBar__RenderingBox button-bar">
                            <button type="button" className="button" onClick={onProjectRender}><i className="icon far fa-eye"></i><span>Render</span></button>
                            <div className="button">
                                <label htmlFor="EditorPanelAutoRenderCheckBox">
                                    Auto :
                                </label>
                                <input type="checkbox" id="EditorPanelAutoRenderCheckBox" name="EditorPanelAutoRenderCheckBox" defaultChecked={props.editorPreferences.autoRenderFilter == RenderFilter.ALL} onChange={onAutoRenderChanged}/>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
                : <div className="EditorPanel_projectNotFound">
                    No Project Found
            </div>}
        </div>
    )
}

function mapStateToProps(state: ApplicationState) {
    return {
        project: state.project,
        ui: state.ui.editor,
        editorPreferences: state.preferences.editor
    }

}

export default connect(
    mapStateToProps
)(EditorPanel)