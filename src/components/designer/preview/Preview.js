/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col } from 'react-bootstrap';
import { cloneDeep } from 'lodash';
// import LoadingActions from 'src/stores/alt/actions/LoadingActions';
import { downloadFile } from 'generic-ui-core';
import ButtonConfirm from '../../fields/ButtonConfirm';
import ButtonTooltip from '../../fields/ButtonTooltip';
import GenInterface from '../../details/GenInterface';
import { responseExt } from '../../../utils/template/action-handler';
import { notifySuccess } from '../../../utils/template/designer-message';

export default class Preview extends Component {
  constructor(props) {
    super(props);
    this.state = { revisions: [], compareUUID: 'current', fullScreen: false };
    this.compare = this.compare.bind(this);
    this.setRevision = this.setRevision.bind(this);
    this.delRevision = this.delRevision.bind(this);
    this.retrieveRevision = this.retrieveRevision.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
    this.dlRevision = this.dlRevision.bind(this);
    this.setScreen = this.setScreen.bind(this);
  }

  componentDidMount() {
    if (this.props.revisions) {
      this.setRevision(cloneDeep(this.props.revisions));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.revisions !== prevProps.revisions) {
      this.setRevision(cloneDeep(this.props.revisions));
    }
  }

  handleChanged(el) {
    const { compareUUID, revisions } = this.state;
    const { src } = this.props;
    let selected = (revisions || []).find(r => r.uuid === compareUUID);
    if (selected && selected[src]) {
      selected = el;
      this.setRevision(revisions);
    }
  }

  setRevision(revisions) {
    this.setState({ revisions });
  }

  setScreen(fullScreen) {
    this.setState({ fullScreen });
  }

  compare(params) {
    const { revisions } = this.props;
    // LoadingActions.start();
    this.setState(
      { revisions: cloneDeep(revisions), compareUUID: params.uuid } // ,
      // LoadingActions.stop()
    );
  }

  delRevision(params) {
    const { fnDelete } = this.props;
    fnDelete(params);
  }

  retrieveRevision(params) {
    const { fnRetrieve, revisions, src, data } = this.props;
    // LoadingActions.start();
    const deep = cloneDeep(revisions.find(r => r.id === params.id));
    // fnRetrive(deep[src], () => LoadingActions.stop());
    if (src === 'properties_release') {
      data.properties_template = deep[src];
      fnRetrieve(responseExt(notifySuccess(), data, { active: 'w' }));
    } else {
      fnRetrieve(deep[src], () => {});
    }
  }

  dlRevision(params) {
    const { data, revisions } = this.props;
    const revision = revisions.find(r => r.id === params.id);
    const props = revision.properties_release;
    props.klass = revision.properties_release.klass;
    props.released_at = revision.released_at || '';
    const href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(revision.properties_release)
    )}`;
    downloadFile({
      contents: href,
      name: `${props.klass}_${data.label}_${revision.uuid}.json`,
    });
  }

  render() {
    const { compareUUID, revisions, fullScreen } = this.state;
    if (revisions.length < 1) return null;
    const { data, src, canDL } = this.props;
    const t = (v, idx) => {
      const s = v.uuid === compareUUID ? 'generic_block_select' : '';
      const ver = v.released_at ? `Id: ${v.uuid}` : 'Id:';
      let at = v.released_at
        ? `Released at: ${v.released_at} (UTC)`
        : '(In Progress)';
      if (src === 'properties') {
        at = `saved at: ${v.released_at} (UTC)`;
      }

      const del =
        v.released_at && idx > 1 ? (
          <ButtonConfirm
            msg="Delete this version permanently?"
            fnClick={this.delRevision}
            fnParams={{ id: v.id, data, uuid: v.uuid }}
            bs="default"
            place="top"
          />
        ) : null;
      const ret = v.released_at ? (
        <ButtonConfirm
          msg="Retrieve this version?"
          fnClick={this.retrieveRevision}
          fnParams={{ id: v.id }}
          fa="faReply"
          bs="default"
          place="top"
        />
      ) : null;
      const dl = canDL ? (
        <ButtonTooltip
          tip="Download this version"
          fnClick={this.dlRevision}
          element={{ id: v.id }}
          fa="faDownload"
          place="top"
          bs="default"
        />
      ) : null;
      return (
        <div className={`generic_version_block ${s}`} key={v.uuid}>
          <div>
            <div style={{ width: '100%' }}>{ver}</div>
            <div style={{ color: 'blue' }}>{v.version}</div>
            <div style={{ fontSize: '0.8rem' }}> #{idx + 1}</div>
          </div>
          <div>
            <div style={{ width: '100%' }}>{at}</div>
            {del}
            {dl}
            {ret}
            <ButtonTooltip
              tip="View this version"
              fnClick={this.compare}
              element={{ uuid: v.uuid }}
              fa="faEye"
              place="top"
              bs="default"
            />
          </div>
        </div>
      );
    };
    const options = [];
    const selected = (revisions || []).find(r => r.uuid === compareUUID) || {};
    const selectOptions =
      (selected && selected[src] && selected[src].select_options) || {};

    if (selected.name) {
      options.push({
        generic: selected,
        type: 'text',
        isEditable: true,
        isRequire: false,
        field: 'name',
      });
    }

    selected[src] = selected[src] || {};
    selected[src].layers = selected[src].layers || {};
    if (src === 'properties') {
      selected.properties_release = { select_options: selectOptions };
    } else {
      selected.properties = selected.properties_release;
    }

    const layersLayout = (
      <GenInterface
        generic={selected || {}}
        fnChange={this.handleChanged}
        extLayers={options}
        genId={selected.uuid || 0}
        isPreview
        isActiveWF={false}
      />
    );

    const his = fullScreen ? null : (
      <Col md={4}>
        <b>Only show the latest 10 revisions.</b>
        {revisions.map((r, idx) => t(r, idx))}
      </Col>
    );
    const contentCol = fullScreen ? 12 : 8;
    const screenFa = fullScreen
      ? 'faDownLeftAndUpRightToCenter'
      : 'faUpRightAndDownLeftFromCenter';
    const tip = fullScreen ? 'Exit full screen' : 'Full screen';
    return (
      <div>
        {his}
        <Col md={contentCol}>
          <div style={{ margin: '10px 0px' }}>
            <div style={{ float: 'right' }}>
              <ButtonTooltip
                tip={tip}
                fnClick={this.setScreen}
                element={!fullScreen}
                fa={screenFa}
                place="left"
                bs="default"
              />
            </div>
            <Badge style={{ backgroundColor: '#ffc107', color: 'black' }}>
              Sketch Map: The data input here will not be saved.
            </Badge>
          </div>
          <div style={{ width: '100%', minHeight: '50vh' }}>{layersLayout}</div>
        </Col>
      </div>
    );
  }
}

Preview.propTypes = {
  data: PropTypes.object.isRequired,
  revisions: PropTypes.array,
  fnRetrieve: PropTypes.func,
  fnDelete: PropTypes.func,
  canDL: PropTypes.bool,
  src: PropTypes.oneOf(['properties_release', 'properties']),
};

Preview.defaultProps = {
  revisions: [],
  fnRetrieve: () => {},
  fnDelete: () => {},
  src: 'properties_release',
  canDL: false,
};
