// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Tiny CodePro plugin.
 *
 * @module      tiny_codepro/plugin
 * @copyright   2023 Josep Mulet Pol <pep.mulet@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {EditorView, basicSetup} from "codemirror"
import {Compartment} from '@codemirror/state'
import {html} from "@codemirror/lang-html"
import {cm6proDark} from './cm6pro-dark-theme'

const themes = {
    'light': EditorView.baseTheme(),
    'dark': cm6proDark
};

export default class CodeProEditor {
    static getThemes() {
        return ['light', 'dark']
    }
    /**
     * @member {HTMLElement} parentElement
     * @member {string | TinyMCE} source
     * @member {CodeMirrorView} editorView;
     */
    #parentElement;
    #source;
    #editorView;
    
    /**
     * @param {HTMLElement} parentElement 
     */
    constructor(parentElement) { 
        this.#parentElement = parentElement;
        this.#init();
    }

    #init() {
        this.themeConfig = new Compartment();
        this.linewrapConfig = new Compartment();
        this.#editorView = new EditorView({
            extensions: [
                basicSetup, 
                html(),
                this.linewrapConfig.of([EditorView.lineWrapping]),
                this.themeConfig.of([themes['light']])
            ],
            parent: this.#parentElement
        });
    }
    /**
     * 
     * @param {string | TinyMCE} source 
     */
    setValue(source) {
        this.#source = source;
        let code = source || '';
        if(typeof source?.getContent === "function") {
            code = source.getContent();
        }
        const view = this.#editorView;
        view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: code}});
    }
    /**
     * @returns {string}
     */
    getValue() {
        return this.#editorView.state.doc.toString();
    }

    updateContent() {
        if(typeof this.#source?.setContent === "function") {
            this.#source.setContent(this.getValue(), {format: 'html'});
        } else {
            console.log(this.getValue());
        }
    }
    /**
     * 
     * @param {string} theme 
     */
    setTheme(themeName) {
        if (themes[themeName]) { 
            this.#editorView.dispatch({
                effects: this.themeConfig.reconfigure([themes[themeName]])
            });
        } else {
            console.error("Unknown theme", themeName);
        }
    }

    /**
     * 
     * @param {boolean} bool 
     */
    setLineWrapping(bool) {
        this.#editorView.dispatch({
            effects: this.linewrapConfig.reconfigure(bool ? [EditorView.lineWrapping] : [])
        });
    }
}

