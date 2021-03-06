import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Modal from '../components/Modal'
import {
  connectFormState,
  Form,
  Checkbox,
  RadioButton,
  NumberInput
} from '../components/formHelpers'

import { Toolbar } from '../redux/toolbar'
import { Settings } from '../redux/settings'
import * as ReduxRoot from '../redux/root'

import * as selectors from '../redux/selectors'
import * as utils from '../utils'

const ModalTitle = ({children}) => <h2>{children}</h2>
const Title3 = ({children}) => <h3>{children}</h3>
const Title = ({children}) => <h4>{children}</h4>

class GIFExportForm extends Component {
  render () {
    let fps = null
    const delayMS = this.props.state.delayMS
    if (delayMS !== '') {
      const delayInt = parseInt(this.props.state.delayMS, 10)
      if (delayInt !== 0 && !isNaN(delayInt)) {
        const f = 1000.0 / delayInt
        fps = `${Math.round(f)} fps`
      }
    }
    const animControls = () => {
      return (
        <Fragment>
          <label>Gif anim mode:</label>
          <br/>
          <br/>
          <RadioButton
            name='loopMode'
            value='once'
            label='Play once, no looping'
          />
          <RadioButton
            name='loopMode'
            value='loop'
            label='Loop'
          />
          <RadioButton
            name='loopMode'
            value='pingpong'
            label='Loop (ping pong)'
          />
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <NumberInput
              name='delayMS'
              value={delayMS}
              label='Frame delay (ms)'
            />
            <label style={{marginLeft: '10px'}}>
             {fps}
            </label>
          </div>
        </Fragment>
      )
    }
    return (
      <Form state={this.props.state} setField={this.props.setField}>
        <Title>GIF export options</Title>
        <br/>
        <label>Gif anim mode:</label>
        <br/>
        <br/>
        <RadioButton
          name='animMode'
          value='single'
          label='Current screen only'
        />
        <RadioButton
          name='animMode'
          value='anim'
          label='Export .gif anim'
        />
        <br/>
        {this.props.state.animMode === 'single' ? null : animControls()}
      </Form>
    )
  }
}

class PNGExportForm extends Component {
  render () {
    return (
      <Form state={this.props.state} setField={this.props.setField}>
        <Title>PNG export options</Title>
        <br/>
        <br/>
        <Checkbox name='alphaPixel' label='Alpha pixel work-around for Twitter' />
        <Checkbox name='doublePixels' label='Double pixels' />
      </Form>
    )
  }
}

class ASMExportForm extends Component {
  render () {
    return (
      <Form state={this.props.state} setField={this.props.setField}>
        <Title>Assembler export options</Title>
        <br/>
        <br/>
        <RadioButton
          name='assembler'
          value='kickass'
          label='KickAssembler'
        />
        <RadioButton
          name='assembler'
          value='acme'
          label='ACME'
        />
        <RadioButton
          name='assembler'
          value='c64tass'
          label='64tass'
        />
        <br/>
        <Checkbox
          name='currentScreenOnly'
          label='Current screen only'
        />
        <Checkbox
          name='standalone'
          label='Make output compilable to a .prg'
        />
      </Form>
    )
  }
}

class BASICExportForm extends Component {
  render () {
    return (
      <Form state={this.props.state} setField={this.props.setField}>
        <Title>Assembler export options</Title>
        <br/>
        <br/>
        <Checkbox
          name='currentScreenOnly'
          label='Current screen only'
        />
        <Checkbox
          name='standalone'
          label='Add BASIC code to display the image'
        />
      </Form>
    )
  }
}

class ExportForm extends Component {
  render () {
    if (this.props.ext === null) {
      return null
    }
    if (!utils.formats[this.props.ext].exportOptions) {
      return null
    }
    switch (this.props.ext) {
      case 'c':
        return null
      case 'prg':
        return null
      case 'png':
        return (
          <PNGExportForm {...connectFormState(this.props, 'png')} />
        )
      case 'asm':
        return (
          <ASMExportForm {...connectFormState(this.props, 'asm')} />
        )
      case 'bas':
        return (
          <BASICExportForm {...connectFormState(this.props, 'bas')} />
        )
      case 'gif':
        return (
          <GIFExportForm {...connectFormState(this.props, 'gif')} />
        )
      default:
        console.error('unknown export format', this.props.ext)
    }
  }
}

class ExportModal_ extends Component {
  state = {
    png: {
      alphaPixel: false,
      doublePixels: false
    },
    asm: {
      assembler: 'kickass',
      currentScreenOnly: true,
      standalone: false
    },
    bas: {
      currentScreenOnly: true,
      standalone: false
    },
    gif: {
      animMode: 'anim',
      loopMode: 'loop',
      delayMS: '250'
    }
  }

  handleOK = () => {
    const { showExport } = this.props
    this.props.Toolbar.setShowExport({show:false})
    const ext = showExport.type.ext
    this.props.fileExportAs(showExport.type, this.state[ext])
  }

  handleCancel = () => {
    this.props.Toolbar.setShowExport({show:false})
  }

  handleSetState = (cb) => {
    this.setState(prevState => {
      return cb(prevState)
    })
  }

  render () {
    const { showExport } = this.props
    const exportType = showExport.show ? showExport.type : null
    const exportExt = exportType !== null ? exportType.ext : null
    return (
      <div>
        <Modal showModal={this.props.showExport.show}>
          <div style={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <ModalTitle>Export Options</ModalTitle>
              <ExportForm
                ext={exportExt}
                state={this.state}
                setState={this.handleSetState}
              />
            </div>

            <div style={{alignSelf: 'flex-end'}}>
              <button className='cancel' onClick={this.handleCancel}>Cancel</button>
              <button className='primary' onClick={this.handleOK}>Export</button>
            </div>
          </div>

        </Modal>
      </div>
    )
  }
}

export default connect(
  (state) => {
    return {
      showExport: state.toolbar.showExport
    }
  },
  (dispatch) => {
    return {
      Toolbar: Toolbar.bindDispatch(dispatch),
      fileExportAs: (fmt, options) => dispatch(ReduxRoot.actions.fileExportAs(fmt, options))
    }
  }
)(ExportModal_)
