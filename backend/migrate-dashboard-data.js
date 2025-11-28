import { getAllDashboards, updateDashboard } from './database.js';

console.log('=== Dashboard Data Migration Script ===');
console.log('Starting migration...\n');

try {
  const dashboards = getAllDashboards();
  console.log('Found ' + dashboards.length + ' dashboards to process\n');

  let fixedCount = 0;
  let alreadyConsistentCount = 0;

  dashboards.forEach((dashboard, idx) => {
    console.log('\n[' + (idx + 1) + '/' + dashboards.length + '] Processing Dashboard ID: ' + dashboard._id);
    console.log('   Name: "' + dashboard.name + '"');

    const data = dashboard.dashboard;
    const actualWidgetCount = data.gridLayout?.length || 0;
    const currentWidgetsLength = data.widgets?.length || 0;
    const currentMetadataCount = data.metadata?.widgetCount || 0;

    console.log('   Current state:');
    console.log('   - widgets.length:        ' + currentWidgetsLength);
    console.log('   - gridLayout.length:     ' + actualWidgetCount);
    console.log('   - metadata.widgetCount:  ' + currentMetadataCount);

    if (currentWidgetsLength === actualWidgetCount && actualWidgetCount === currentMetadataCount) {
      console.log('   Already consistent - skipping');
      alreadyConsistentCount++;
      return;
    }

    console.log('   Inconsistency detected - fixing...');

    const fixedWidgets = (data.gridLayout || []).map(item => ({
      id: item.i,
      component: item.component,
      props: item.props
    }));

    if (!data.metadata) {
      data.metadata = {};
    }

    const fixedData = {
      ...data,
      widgets: fixedWidgets,
      gridLayout: data.gridLayout || [],
      metadata: {
        ...data.metadata,
        widgetCount: actualWidgetCount,
        lastMigration: new Date().toISOString(),
        migrationReason: 'data-consistency-fix'
      }
    };

    try {
      updateDashboard(dashboard._id, dashboard.name, fixedData, dashboard.theme);
      console.log('   Fixed! All fields now consistent');
      fixedCount++;
    } catch (error) {
      console.error('   Failed to update:', error.message);
    }
  });

  console.log('\n=== Migration Complete ===');
  console.log('Total dashboards processed: ' + dashboards.length);
  console.log('Already consistent: ' + alreadyConsistentCount);
  console.log('Fixed: ' + fixedCount);

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
