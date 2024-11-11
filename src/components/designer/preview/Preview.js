/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import cloneDeep from 'lodash/cloneDeep';
// import LoadingActions from 'src/stores/alt/actions/LoadingActions';
import { downloadFile } from 'generic-ui-core';
import ButtonTooltip from '../../fields/ButtonTooltip';
import GenInterface from '../../details/GenInterface';
import { responseExt } from '../../../utils/template/action-handler';
import { notifySuccess } from '../../../utils/template/designer-message';
import VersionBlock from './VersionBlock';
import { buildString } from '../../tools/utils';

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
    const { revisions } = this.props;
    if (revisions) {
      this.setRevision(cloneDeep(revisions));
    }
  }

  componentDidUpdate(prevProps) {
    const { revisions } = this.props;
    if (revisions !== prevProps.revisions) {
      this.setRevision(cloneDeep(revisions));
    }
  }

  handleChanged(el) {
    const { compareUUID, revisions } = this.state;
    const { src } = this.props;
    let selected = (revisions || []).find(
      (r) => buildString([r.uuid, r.id]) === compareUUID
    );
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
    this.setState({
      revisions: cloneDeep(revisions),
      compareUUID: buildString([params.uuid, params.id]),
    });
  }

  delRevision(params) {
    const { fnDelete } = this.props;
    fnDelete(params);
  }

  retrieveRevision(params) {
    const { fnRetrieve, revisions, src, data } = this.props;
    // LoadingActions.start();
    const deep = cloneDeep(revisions.find((r) => r.id === params.id));
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
    const revision = revisions.find((r) => r.id === params.id);
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

    const options = [];
    const selected =
      (revisions || []).find(
        (r) => buildString([r.uuid, r.id]) === compareUUID
      ) || {};
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
        {revisions.map((rev, idx) => (
          <VersionBlock
            key={buildString([rev.uuid, rev.id])}
            data={data}
            download={{ canDL, fnDownload: this.dlRevision }}
            idxSelect={`${idx}:${compareUUID}`}
            rev={rev}
            src={src}
            fnDelete={this.delRevision}
            fnRetrieve={this.retrieveRevision}
            fnView={this.compare}
          />
        ))}
      </Col>
    );

    const contentCol = fullScreen ? 12 : 8;
    const screenFa = fullScreen
      ? 'faDownLeftAndUpRightToCenter'
      : 'faUpRightAndDownLeftFromCenter';
    const idf = fullScreen ? 'scn_full_exit' : 'scn_full';
    return (
      <Row className="m-2">
        {his}
        <Col md={contentCol}>
          <div style={{ margin: '10px 0px' }}>
            <div style={{ float: 'right' }}>
              <ButtonTooltip
                idf={idf}
                fnClick={this.setScreen}
                element={!fullScreen}
                fa={screenFa}
                place="left"
                bs="default"
                size="sm"
              />
            </div>
            <Badge bg="warning" text="dark">
              Sketch Map: The data input here will not be saved.
            </Badge>
          </div>
          <div style={{ width: '100%', minHeight: '50vh' }}>{layersLayout}</div>
        </Col>
      </Row>
    );
  }
}

Preview.propTypes = {
  data: PropTypes.object,
  revisions: PropTypes.array,
  fnRetrieve: PropTypes.func,
  fnDelete: PropTypes.func,
  canDL: PropTypes.bool,
  src: PropTypes.oneOf(['properties_release', 'properties']),
};

Preview.defaultProps = {
  data: {},
  revisions: [],
  fnRetrieve: () => {},
  fnDelete: () => {},
  src: 'properties_release',
  canDL: false,
};
